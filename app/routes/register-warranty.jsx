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

            /* 2️⃣ SYNC TO HUBSPOT (NON-BLOCKING) */
            const hubspotKey =
                context.env?.HUBSPOT_PRIVATE_ACCESS_KEY ||
                process.env.HUBSPOT_PRIVATE_ACCESS_KEY;

            if (hubspotKey) {
                console.log('[action] Attempting HubSpot Sync...', { hasKey: true });
                try {
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
                        warranty_number: result?.warranty?.warrantyNumber, // generated in actions.js
                        order_number: orderNumber
                    };
                    await submitToHubSpot(hubspotData, cleanKey);
                } catch (hsError) {
                    console.error('[action] HubSpot Sync Failed:', hsError);
                    return { error: `HubSpot Sync Failed: ${hsError.message}` };
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
        <div className="min-h-screen bg-[#b3b3b3] flex flex-col relative pb-0">
            <div className="flex flex-col items-center px-4 pt-12 md:pt-20 w-full flex-grow">

                <WarrantyForm
                    actionData={actionData || { registered, warranty }}
                    productData={verifiedProduct}
                    customerId={customerId}
                    initialOrderNumber={orderNumber}
                    initialEmail={email}
                />

                <div className="mt-12 text-center max-w-2xl px-4 pb-12">
                    <p className="text-gray-700 font-medium text-lg leading-relaxed">
                        Register your ProLock to activate your <strong>Anti-Theft Guarantee</strong>.
                        We stand behind our product with a valid warranty registration.
                    </p>
                </div>
            </div>

            <div className="w-full bg-[#e31722] text-white py-12 mt-24">
                <div className="w-[80%] mx-auto text-center">
                    <p className="text-lg md:text-xl leading-relaxed max-w-5xl mx-auto font-medium opacity-95">
                        If your vehicle is stolen within one year while ProLock is correctly fitted,
                        we will pay up to $2000 of your insurance excess. Terms and conditions apply.
                    </p>

                    <p className="mt-6 text-lg md:text-xl leading-relaxed max-w-5xl mx-auto font-medium opacity-95">
                        Keep your purchase receipt safely for one year and contact us in the event of a claim.
                    </p>

                    <div className="w-full border-t-2 border-dashed border-white/600 my-10"></div>
                </div>
            </div>
        </div>
    );
}
