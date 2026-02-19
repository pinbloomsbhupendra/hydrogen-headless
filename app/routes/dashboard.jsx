import { redirect, useLoaderData } from 'react-router';
import { UserDashboard } from '../components/user-dashboard/user-dashboard';
import { PRODUCT_IMAGE_QUERY } from '~/graphql/product/queries';
import { CUSTOMER_QUERY } from '~/graphql/customer/queries';

export async function loader({ context }) {
    const customerAccessToken = await context.session.get('customerAccessToken');

    if (!customerAccessToken) {
        return redirect('/login');
    }

    // 1. Fetch Customer Details
    const { customer } = await context.storefront.query(CUSTOMER_QUERY, {
        variables: { customerAccessToken },
        cache: context.storefront.CacheNone(),
    });

    if (!customer) {
        return redirect('/login');
    }

    let warranties = [];
    const email = customer.email;

    // 2. Fetch Warranty from HubSpot (Only Source)
    if (email) {
        // Use provided token or env var
        const hubspotKey = context.env?.HUBSPOT_PRIVATE_ACCESS_KEY || process.env.HUBSPOT_PRIVATE_ACCESS_KEY;

        if (hubspotKey) {
            try {
                // Sanitize key: remove "Bearer " if present, then add it back cleanly
                const cleanKey = hubspotKey.replace(/^Bearer\s+/i, '');

                // Fetch from HubSpot
                // Properties to fetch: email, firstname, warranty_number, serial_number, purchase_date, product_name, order_id
                const properties = [
                    'email',
                    'firstname',
                    'warranty_number',
                    'serial_number',
                    'purchase_date',
                    'product_name',
                    'order_id'
                ].join(',');

                // Search for contact by email to get ID first, or use the email endpoint if available
                // simpler approach: search endpoint
                const searchResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${cleanKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        filterGroups: [{
                            filters: [{
                                propertyName: 'email',
                                operator: 'EQ',
                                value: email
                            }]
                        }],
                        properties: ['email', 'firstname', 'warranty_number', 'serial_number', 'purchase_date', 'product_name', 'order_id'],
                        limit: 1
                    })
                });

                if (searchResponse.ok) {
                    const searchData = await searchResponse.json();
                    if (searchData.total > 0) {
                        const contactId = searchData.results[0].id;

                        // Fetch Associated "Warranty Registrations" (ID: 2-225350388)
                        const assocRes = await fetch(`https://api.hubapi.com/crm/v4/objects/contacts/${contactId}/associations/2-225350388`, {
                            method: 'GET',
                            headers: { Authorization: `Bearer ${cleanKey}` }
                        });

                        if (assocRes.ok) {
                            const assocData = await assocRes.json();
                            const warrantyIds = assocData.results.map(a => a.toObjectId);

                            if (warrantyIds.length > 0) {
                                // 3. Batch Read Warranty Details
                                const batchRes = await fetch(`https://api.hubapi.com/crm/v3/objects/2-225350388/batch/read`, {
                                    method: 'POST',
                                    headers: { Authorization: `Bearer ${cleanKey}`, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        inputs: warrantyIds.map(id => ({ id })),
                                        properties: ['warranty_number', 'serial_number', 'product_name', 'model_type', 'order_id', 'purchase_date']
                                    })
                                });

                                if (batchRes.ok) {
                                    const batchData = await batchRes.json();

                                    // Map to Warranty Objects
                                    warranties = batchData.results.map(item => {
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

                                        // Image Logic
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
                                }
                            }
                        }
                    }
                } else {
                    const errorText = await searchResponse.text();
                    console.error('HubSpot Search Failed:', searchResponse.status, errorText);
                }

            } catch (err) {
                console.error('HubSpot Fetch Error:', err);
            }
        } else {
            console.warn('HUBSPOT_PRIVATE_ACCESS_KEY missing in dashboard loader.');
        }
    }

    return { customer, warranties };
}

export default function Dashboard() {
    const { customer, warranties } = useLoaderData();
    // For now, satisfy UserDashboard prop by passing the first one or changing UserDashboard
    // But since UserDashboard only supports ONE, we pass the first or pass prop "warranties" if it supported it.
    // I will pass "warranty={warranties[0]}" for minimal disruption, or "warranties" if I update UserDashboard.
    // The user wants "warranties".
    return <UserDashboard customer={customer} warranties={warranties} warranty={warranties[0]} />;
}
