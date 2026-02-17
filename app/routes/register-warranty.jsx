import { redirect, useLoaderData, useActionData } from 'react-router';
import WarrantyForm from '../components/WarrantyForm';
import { getOrderBySerial, checkWarrantyStatus, registerWarranty } from '../lib/actions';
import { submitToHubSpot } from '../graphql/hubspot/hubspot-forms';

/* ======================================================
   LOADER
====================================================== */
export async function loader({ request, context }) {
    const url = new URL(request.url);
    const serial = url.searchParams.get('serial')?.toUpperCase().trim();

    let customerId = null;
    let warrantyStatus = {};
    let verifiedProduct = null;

    try {
        const isLoggedIn = await context.customerAccount.isLoggedIn();

        if (isLoggedIn) {
            const { data } = await context.customerAccount.query(`
                query {
                    customer { id }
                }
            `);

            customerId = data?.customer?.id || null;

            if (customerId) {
                warrantyStatus = await checkWarrantyStatus(customerId);
            }
        }
    } catch (err) {
        console.error('Login check failed:', err);
    }

    if (serial) {
        try {
            const result = await getOrderBySerial(serial);

            if (Array.isArray(result) && result.length > 0) {
                verifiedProduct = result[0];
            } else if (result && !Array.isArray(result)) {
                verifiedProduct = result;
            }
        } catch (err) {
            console.error('Serial lookup failed:', err);
        }
    }

    return {
        customerId,
        verifiedProduct,
        serial,
        ...warrantyStatus
    };
}

/* ======================================================
   ACTION
====================================================== */
export async function action({ request, context }) {
    const formData = await request.formData();
    const actionType = formData.get('actionType');

    /* -----------------------------
       VERIFY SERIAL
    ----------------------------- */
    if (actionType === 'verify') {
        const serial = formData.get('serial')?.toUpperCase().trim();

        if (!serial) {
            return { error: 'SERIAL NUMBER IS REQUIRED.' };
        }

        const result = await getOrderBySerial(serial);

        if (!result || (Array.isArray(result) && result.length === 0)) {
            return { error: 'INVALID SERIAL NUMBER. PLEASE CHECK AND TRY AGAIN.' };
        }

        return redirect(`/register-warranty?serial=${serial}`);
    }

    /* -----------------------------
       REGISTER WARRANTY
    ----------------------------- */
    if (actionType === 'register') {
        const serial = formData.get('serial')?.toUpperCase().trim();

        try {
            // Get logged in customer (optional)
            let customerId = null;

            try {
                const isLoggedIn = await context.customerAccount.isLoggedIn();

                if (isLoggedIn) {
                    const { data } = await context.customerAccount.query(`
                        query {
                            customer { id }
                        }
                    `);

                    customerId = data?.customer?.id || null;
                }
            } catch (err) {
                console.error('Customer fetch failed:', err);
            }

            /* 1️⃣ SAVE TO INTERNAL BACKEND */
            const payload = {
                shopifyCustomerId: customerId,
                email: formData.get('email'),
                customerName: `${formData.get('firstName')} ${formData.get('lastName')}`.trim(),
                productName: formData.get('productTitle'),
                serial: serial,
                productImage: formData.get('productImage'),
                purchaseDate: formData.get('purchaseDate'),
            };

            const result = await registerWarranty(payload);

            /* 2️⃣ SYNC TO HUBSPOT (NON-BLOCKING) */
            const hubspotKey =
                context.env?.HUBSPOT_PRIVATE_ACCESS_KEY ||
                process.env.HUBSPOT_PRIVATE_ACCESS_KEY;

            if (hubspotKey) {
                try {
                    // Sanitize key
                    const cleanKey = hubspotKey.replace(/^Bearer\s+/i, '');

                    const hubspotData = {
                        email: formData.get('email'),
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
                        warranty_number: result?.warranty?.warrantyNumber
                    };

                    await submitToHubSpot(hubspotData, cleanKey);
                    console.log('HubSpot Sync Successful');
                } catch (hsError) {
                    console.error('HubSpot Sync Failed (Non-blocking):', hsError);
                }
            } else {
                console.warn('HUBSPOT_PRIVATE_ACCESS_KEY missing.');
            }

            return redirect('/thank-you');

        } catch (error) {
            console.error('Warranty registration failed:', error);
            return { error: error.message || 'Registration failed.' };
        }
    }

    return null;
}

/* ======================================================
   COMPONENT
====================================================== */
export default function WarrantyPage() {
    const { customerId, registered, warranty, verifiedProduct, serial } =
        useLoaderData();

    const actionData = useActionData();

    return (
        <div className="min-h-screen bg-[#b3b3b3] flex flex-col relative pb-0">
            <div className="flex flex-col items-center px-4 pt-12 md:pt-20 w-full flex-grow">

                <WarrantyForm
                    actionData={actionData || { registered, warranty }}
                    productData={verifiedProduct}
                    customerId={customerId}
                    serial={serial}
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
