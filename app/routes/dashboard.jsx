import { redirect, useLoaderData } from 'react-router';
import { UserDashboard } from '../components/user-dashboard/user-dashboard';
import { PRODUCT_IMAGE_QUERY } from '../lib/storefront-queries';
import { CUSTOMER_DASHBOARD_QUERY } from '~/graphql/customer-account/CustomerDashboard';

export async function loader({ context }) {
    const isLoggedIn = await context.customerAccount.isLoggedIn();
    if (!isLoggedIn) {
        return redirect('/login');
    }

    // 1. Fetch Customer Details
    const { data } = await context.customerAccount.query(CUSTOMER_DASHBOARD_QUERY);

    const customer = data?.customer;
    let warranty = null;

    if (customer?.emailAddress?.emailAddress) {
        const email = customer.emailAddress.emailAddress;

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
                        const contact = searchData.results[0];
                        const props = contact.properties;

                        // Check if warranty data exists
                        if (props.serial_number || props.warranty_number) {

                            // Calculate Expiry (1 Year from purchase)
                            let expirationDate = null;
                            let purchaseDate = null;

                            if (props.purchase_date) {
                                // HubSpot returns UTC timestamp or string
                                // If it's a timestamp (milliseconds)
                                const pDate = new Date(props.purchase_date); // This handles both string and timestamp usually
                                if (!isNaN(pDate.getTime())) {
                                    purchaseDate = pDate.toISOString();
                                    const expDate = new Date(pDate);
                                    expDate.setFullYear(expDate.getFullYear() + 1);
                                    expirationDate = expDate.toISOString();
                                }
                            }

                            warranty = {
                                productName: props.product_name || 'ProLock', // Default to ProLock if missing
                                serial: props.serial_number || 'N/A',
                                warrantyNumber: props.warranty_number,
                                orderId: props.order_id,
                                purchaseDate: purchaseDate,
                                expirationDate: expirationDate,
                                // Use a default image if not in HS (HS doesn't store images usually)
                                productImage: 'https://cdn.shopify.com/s/files/1/0663/8275/8077/files/prolock-product.png?v=1706692855' // Replace with actual default or logic
                            };
                        }
                    }
                } else {
                    const errorText = await searchResponse.text();
                    console.error('HubSpot Search Failed:', searchResponse.status, errorText);
                }

                // 2. Determine Product Image
                // Priority: Static Mapping -> Dynamic Shopify Fetch -> Default
                if (warranty && warranty.productName) {
                    const lowerName = warranty.productName.toLowerCase();

                    if (lowerName.includes('guardian')) {
                        warranty.productImage = '/img2.png';
                    } else if (lowerName.includes('prolock')) {
                        warranty.productImage = '/img1.png'; // Matches buy-prolock.jsx
                    } else {
                        // Dynamic Fetch Fallback
                        try {
                            const { products } = await context.storefront.query(PRODUCT_IMAGE_QUERY, {
                                variables: {
                                    query: warranty.productName
                                }
                            });

                            const shopifyProduct = products.nodes[0];
                            if (shopifyProduct?.featuredImage?.url) {
                                warranty.productImage = shopifyProduct.featuredImage.url;
                            }
                        } catch (shopifyErr) {
                            console.error('Shopify Product Fetch Failed:', shopifyErr);
                        }
                    }
                }

            } catch (err) {
                console.error('HubSpot Fetch Error:', err);
            }
        } else {
            console.warn('HUBSPOT_PRIVATE_ACCESS_KEY missing in dashboard loader.');
        }
    }

    return { customer, warranty };
}

export default function Dashboard() {
    const { customer, warranty } = useLoaderData();
    return <UserDashboard customer={customer} warranty={warranty} />;
}

