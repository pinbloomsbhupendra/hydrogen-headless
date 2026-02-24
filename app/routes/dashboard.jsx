import { redirect, useLoaderData, Await } from 'react-router';
import { Suspense } from 'react';
import { UserDashboard } from '../components/user-dashboard/user-dashboard';
import { CUSTOMER_QUERY } from '~/graphql/customer/queries';

/**
 * Fetch warranties asynchronously to avoid blocking the main page load.
 */
async function getWarranties(email, context) {
    if (!email) return [];

    const hubspotKey = context.env?.HUBSPOT_PRIVATE_ACCESS_KEY || process.env.HUBSPOT_PRIVATE_ACCESS_KEY;
    if (!hubspotKey) {
        console.warn('HUBSPOT_PRIVATE_ACCESS_KEY missing.');
        return [];
    }

    try {
        const cleanKey = hubspotKey.replace(/^Bearer\s+/i, '');

        // 1. Search for contact to get ID
        const searchResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${cleanKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
                limit: 1
            })
        });

        if (!searchResponse.ok) return [];
        const searchData = await searchResponse.json();
        if (searchData.total === 0) return [];

        const contactId = searchData.results[0].id;

        // 2. Get Association IDs (Warranty Object 2-225350388)
        const assocRes = await fetch(`https://api.hubapi.com/crm/v4/objects/contacts/${contactId}/associations/2-225350388`, {
            headers: { Authorization: `Bearer ${cleanKey}` }
        });

        if (!assocRes.ok) return [];
        const assocData = await assocRes.json();
        const warrantyIds = assocData.results.map(a => a.toObjectId);
        if (warrantyIds.length === 0) return [];

        // 3. Batch Read Details
        const batchRes = await fetch(`https://api.hubapi.com/crm/v3/objects/2-225350388/batch/read`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${cleanKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inputs: warrantyIds.map(id => ({ id })),
                properties: ['warranty_number', 'serial_number', 'product_name', 'model_type', 'order_id', 'purchase_date']
            })
        });

        if (!batchRes.ok) return [];
        const batchData = await batchRes.json();

        return batchData.results.map(item => {
            const props = item.properties;
            let expirationDate = null;
            let purchaseDate = null;

            if (props.purchase_date) {
                const pDate = new Date(props.purchase_date);
                if (!isNaN(pDate.getTime())) {
                    purchaseDate = pDate.toISOString();
                    const expDate = new Date(pDate);
                    expDate.setFullYear(expDate.getFullYear() + 1);
                    expirationDate = expDate.toISOString();
                }
            }

            // Simple product image logic
            let productImage = 'https://cdn.shopify.com/s/files/1/0663/8275/8077/files/prolock-product.png?v=1706692855';
            if (props.product_name) {
                const lowerName = props.product_name.toLowerCase();
                if (lowerName.includes('guardian')) productImage = '/img2.png';
                else if (lowerName.includes('prolock')) productImage = '/img1.png';
            }

            return {
                id: item.id,
                productName: props.product_name || 'ProLock',
                modelType: props.model_type,
                serial: props.serial_number || 'N/A',
                warrantyNumber: props.warranty_number,
                orderId: props.order_id,
                purchaseDate: purchaseDate,
                expirationDate: expirationDate,
                productImage: productImage
            };
        });
    } catch (e) {
        console.error('[Loader:getWarranties] Error:', e);
        return [];
    }
}

export async function loader({ context }) {
    const customerAccessToken = await context.session.get('customerAccessToken');

    if (!customerAccessToken) {
        return redirect('/login');
    }

    const { customer } = await context.storefront.query(CUSTOMER_QUERY, {
        variables: { customerAccessToken },
        cache: context.storefront.CacheNone(),
    });

    if (!customer) {
        return redirect('/login');
    }

    // Use defer to return the customer immediately, while warranties load in background
    return {
        customer,
        warranties: getWarranties(customer.email, context)
    };
}

export default function Dashboard() {
    const { customer, warranties } = useLoaderData();

    return (
        <Suspense fallback={<DashboardSkeleton customer={customer} />}>
            <Await resolve={warranties}>
                {(resolvedWarranties) => (
                    <UserDashboard
                        customer={customer}
                        warranties={resolvedWarranties}
                    />
                )}
            </Await>
        </Suspense>
    );
}

function DashboardSkeleton({ customer }) {
    return (
        <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-112px)] bg-gray-50 py-8 md:py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-wrap justify-between items-end mb-8 border-b-4 border-gray-200 pb-4 animate-pulse gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase italic text-gray-200">My Dashboard</h1>
                        <p className="text-sm font-bold text-gray-300 uppercase mt-1">
                            Welcome back, {customer?.firstName || 'Customer'}
                        </p>
                    </div>
                </div>
                <div className="p-8 md:p-12 bg-white rounded-2xl shadow-sm text-center">
                    <div className="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Loading Your Warranties...</p>
                </div>
            </div>
        </div>
    );
}
