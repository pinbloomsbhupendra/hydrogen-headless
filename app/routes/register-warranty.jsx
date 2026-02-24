import { redirect, useLoaderData, useActionData } from 'react-router';
import WarrantyForm from '../components/WarrantyForm';
import { verifyCustomerOrder, checkWarrantyStatus, registerWarranty } from '../lib/actions';
import { submitToHubSpot } from '../graphql/hubspot/mutations';
import { CUSTOMER_QUERY } from '../graphql/customer/queries';

/* ======================================================
   HELPERS – pull Admin API credentials from env
====================================================== */
function getAdminCreds(context) {
    const env = context.env || process.env || {};

    // Check multiple possible names for the admin token
    const adminToken =
        env.SHOPIFY_ADMIN_API_TOKEN ||
        env.SHOPIFY_ADMIN_TOKEN ||
        env.PRIVATE_ADMIN_API_TOKEN ||
        null;

    // Check multiple possible names for the shop domain
    const shopDomain =
        env.PUBLIC_STORE_DOMAIN ||
        env.SHOP_DOMAIN ||
        'iqwxvr-b0.myshopify.com'; // Hardcoded fallback for this specific store

    console.log('[getAdminCreds] Discovery:', {
        hasToken: !!adminToken,
        shopDomain,
        availableKeys: Object.keys(env).filter(k => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('TOKEN')) // Log safe keys
    });

    return { adminToken, shopDomain };
}

/* ======================================================
   LOADER
====================================================== */
export async function loader({ request, context }) {
    const url = new URL(request.url);
    const orderNumber = url.searchParams.get('orderNumber');
    const email = url.searchParams.get('email');
    const customerAccessToken = await context.session.get('customerAccessToken');

    let customerId = null;
    let warrantyStatus = {};
    let verifiedProduct = null;

    const { adminToken, shopDomain } = getAdminCreds(context);

    const isNewRegistration = url.searchParams.get('new') === 'true';

    /* ── Customer lookup ─────────────────────────────────── */
    if (customerAccessToken) {
        try {
            const { customer } = await context.storefront.query(CUSTOMER_QUERY, {
                variables: { customerAccessToken },
                cache: context.storefront.CacheNone(),
            });

            customerId = customer?.id || null;

            if (customerId && adminToken && !isNewRegistration) {
                // Using Admin API to check metafield status
                const status = await checkWarrantyStatus(customerId, adminToken, shopDomain);

                // If registered, check if it's the SAME order
                if (status.registered && status.warranty) {
                    const existingOrder = status.warranty.orderNumber || status.warranty.orderId;
                    // If the existing warranty is for a DIFFERENT order, allow new registration (overwrite)
                    // We only block if it's the SAME order
                    if (orderNumber && existingOrder && existingOrder.toString() !== orderNumber.toString()) {
                        // Different order -> Treat as NOT registered (so form shows)
                        warrantyStatus = {};
                    } else {
                        warrantyStatus = status;
                    }
                }
            }
        } catch (err) {
            console.error('[loader] Customer fetch failed:', err);
        }
    }

    /* ── Order verification (Admin GraphQL API) ──────────── */
    if (orderNumber && email && adminToken) {
        try {
            const result = await verifyCustomerOrder(orderNumber, email, adminToken, shopDomain);
            if (result && !result.error) {
                verifiedProduct = result;
            }
        } catch (err) {
            console.error('[loader] Order verification failed:', err);
        }
    }

    return {
        customerId,
        verifiedProduct,
        orderNumber,
        email,
        ...warrantyStatus,
    };
}

/* ======================================================
   ACTION
====================================================== */
export async function action({ request, context }) {
    const formData = await request.formData();
    const actionType = formData.get('actionType');
    const { adminToken, shopDomain } = getAdminCreds(context);

    /* -----------------------------
       VERIFY ORDER
    ----------------------------- */
    if (actionType === 'verify') {
        const orderNumber = formData.get('orderNumber')?.trim();
        const email = formData.get('email')?.trim();

        if (!orderNumber || !email) {
            return { error: 'ORDER NUMBER AND EMAIL ARE REQUIRED.' };
        }

        const result = await verifyCustomerOrder(orderNumber, email, adminToken, shopDomain);

        if (!result || result.error) {
            return {
                error: result?.error || 'ORDER NOT FOUND OR INVALID. PLEASE CHECK DETAILS.',
            };
        }

        return redirect(`/register-warranty?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`);
    }

    /* -----------------------------
       REGISTER WARRANTY
    ----------------------------- */
    if (actionType === 'register') {
        const serial = formData.get('serial')?.toUpperCase().trim();
        const email = formData.get('email');
        const orderNumber = formData.get('orderNumber');

        try {
            // Re-verify to get secure IDs (Internal trust)
            const cryptoVerified = await verifyCustomerOrder(orderNumber, email, adminToken, shopDomain);

            if (!cryptoVerified || cryptoVerified.error) {
                return { error: 'Verification failed during registration. Please try again.' };
            }

            const { orderId, customerId: orderCustomerId } = cryptoVerified;

            // Prefer order's customer ID, fallback to logged-in user if available (but usually order exists)
            // If order has no customer, we can't save metafield to customer.
            // But verifyCustomerOrder returns customerId if present.

            if (!orderCustomerId) {
                // This is an edge case: Guest checkout without account creation?
                // We might need to rely on the Order Tagging then.
                console.warn('No customer found on order. Proceeding with Order Tagging only.');
            }

            /* 1️⃣ SAVE TO SHOPIFY (Hydrogen Only - No External Backend) */
            // We save to Customer Metafield if possible
            const payload = {
                shopifyCustomerId: orderCustomerId, // The ID to attach the metafield to
                orderId: orderId,
                email: email,
                customerName: `${formData.get('firstName')} ${formData.get('lastName')}`.trim(),
                productName: formData.get('productTitle'),
                serial: serial,
                productImage: formData.get('productImage'),
                purchaseDate: formData.get('purchaseDate'),
                orderNumber: orderNumber,
            };

            // Call our new "backend-less" function
            // If shopifyCustomerId is null, this might fail or skip metafield part
            const result = await registerWarranty(payload, adminToken, shopDomain);

            /* 2️⃣ SYNC TO HUBSPOT (BACKGROUND - INSTANT SPEED) */
            const hubspotKey = context.env?.HUBSPOT_PRIVATE_ACCESS_KEY || process.env.HUBSPOT_PRIVATE_ACCESS_KEY;

            if (hubspotKey) {
                const cleanKey = hubspotKey.replace(/^Bearer\s+/i, '');
                const hubspotData = {
                    email: email,
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                    city: formData.get('city'),
                    state: formData.get('state'),
                    zip: formData.get('zip'),
                    country: formData.get('country'),
                    purchaseDate: formData.get('purchaseDate'),
                    serial: serial,
                    product_name: formData.get('productTitle'),
                    warranty_number: result?.warranty?.warrantyNumber,
                    order_number: orderNumber
                };

                // 1. FAST CHECK (Awaited to catch duplicates)
                const saveToHubSpot = await submitToHubSpot(hubspotData, cleanKey);

                // 2. BACKGROUND SAVE (Not awaited, instant redirect)
                if (typeof saveToHubSpot === 'function') {
                    if (context.waitUntil) {
                        context.waitUntil(saveToHubSpot().catch(e => console.error('[Background HS Sync Error]', e)));
                    } else {
                        saveToHubSpot().catch(e => console.error('[Background HS Sync Error]', e));
                    }
                }
            }

            return redirect('/thank-you');

        } catch (error) {
            console.error('[action] Registration failed:', error);
            return { error: error.message || 'Registration failed.' };
        }
    }

    return null;
}

/* ======================================================
   COMPONENT
====================================================== */
export default function WarrantyPage() {
    const { customerId, registered, warranty, verifiedProduct, orderNumber, email } =
        useLoaderData();

    const actionData = useActionData();

    return (
        <div className="bg-[#B2B4B8] min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-112px)] flex flex-col pt-6 md:pt-8">
            <div className="flex-grow flex flex-col items-center w-full max-w-7xl mx-auto px-4">
                {/* Header Badge */}
                <div className="bg-prolock-red border-2 border-white px-6 md:px-8 py-2 md:py-3 mb-4 shadow-sm">
                    <h1 className="text-white text-xl md:text-3xl font-bold italic tracking-wide text-center uppercase">
                        Register Your Warranty
                    </h1>
                </div>

                {/* Subtitle */}
                <p className="text-center text-sm md:text-base font-medium text-[#333333] max-w-3xl mb-8 md:mb-12 italic px-2">
                    Please complete this warranty registration for your Prolock and Prolock Guardian Purchase
                    <br className="hidden md:block" />
                    from any retail store in Australia or New Zealand
                </p>

                {/* Form Component Container */}
                <div className="w-full flex justify-center pb-12 md:pb-20">
                    <WarrantyForm
                        actionData={actionData || { registered, warranty }}
                        productData={verifiedProduct}
                        customerId={customerId}
                        initialOrderNumber={orderNumber}
                        initialEmail={email}
                    />
                </div>
            </div>

            {/* Red Footer Area — no relative/absolute; content flows naturally */}
            <div className="w-full bg-prolock-red text-white pt-8 md:pt-10 px-4 shadow-inner">
                <div className="max-w-6xl mx-auto flex flex-col items-center text-center pb-4">
                    <p className="text-sm mb-4 font-medium max-w-4xl opacity-90 leading-relaxed px-2">
                        In the event of your vehicle being stolen with Prolock correctly fitted within one year
                        of the purchase date (and if your insurance company accepts the claim), we will pay
                        up to $2000 of your motor vehicle insurance policy excess.
                    </p>
                    <p className="text-sm mb-4 font-medium max-w-4xl opacity-90 leading-relaxed px-2">
                        Simply keep your record of purchase (receipt) in a safe place for one year.<br />
                        Fill in this registration form and contact Sporting Enterprises in the event of a claim.
                    </p>

                    <div className="w-full border-t border-dashed border-white/50 my-5"></div>

                    {/* Footer Links and Logo row */}
                    <div className="w-full flex flex-col md:flex-row justify-between items-start text-left gap-8 px-2 pb-6">
                        {/* Logo Left */}
                        <div className="w-full md:w-1/3 pt-1">
                            <h2 className="text-black font-black italic text-4xl md:text-5xl tracking-tighter logo-text">PROLOCK</h2>
                        </div>

                        {/* Links Right */}
                        <div className="w-full md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                            <ul className="space-y-3">
                                <li className="font-bold mb-3 text-sm">Prolock</li>
                                <li><a href="/buy-prolock" className="hover:underline opacity-90">Prolock Original</a></li>
                                <li><a href="/buy-prolock-guardian" className="hover:underline opacity-90">Prolock Guardian</a></li>
                                <li><a href="/faq" className="hover:underline opacity-90">All Models</a></li>
                            </ul>
                            <ul className="space-y-3">
                                <li className="font-bold mb-3 text-sm">Information</li>
                                <li><a href="/policies/privacy-policy" className="hover:underline opacity-90">Privacy Policy</a></li>
                                <li><a href="/policies/refund-policy" className="hover:underline opacity-90">Refund Policy</a></li>
                                <li><a href="/policies/shipping-policy" className="hover:underline opacity-90">Shipping Policy</a></li>
                            </ul>
                            <ul className="space-y-3 col-span-2 sm:col-span-1">
                                <li className="font-bold mb-3 text-sm">About</li>
                                <li><a href="/#about" className="hover:underline opacity-90">About Us</a></li>
                                <li><a href="/contact" className="hover:underline opacity-90">Contact</a></li>
                                <li><a href="/policies/terms-of-service" className="hover:underline opacity-90">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar — static, no absolute positioning */}
                <div className="w-full bg-[#111111] py-2 px-4 flex flex-col sm:flex-row justify-between items-center gap-1 text-[10px] text-gray-500">
                    <p>© Prolock Intelligent Security Locks</p>
                    <p>Prolock is a Sporting Brand</p>
                </div>
            </div>
        </div>
    );
}
