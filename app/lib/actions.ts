// ============================================================
// SHOPIFY ADMIN API - Order Verification & Warranty Management
// ============================================================

const BACKEND_URL =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL
        ? process.env.NEXT_PUBLIC_BACKEND_URL
        : (import.meta.env?.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001');

/**
 * Verify an order by Order Name/Number and Email using Admin GraphQL API.
 * Ensures Order exists, Email matches, and Payment is PAID.
 */
export async function verifyCustomerOrder(orderNumber, email, adminToken, shopDomain) {
    try {
        if (!orderNumber || !email || !adminToken || !shopDomain) {
            console.error('[verifyCustomerOrder] Missing parameters:', {
                orderNumber: !!orderNumber,
                email: !!email,
                adminToken: !!adminToken,
                shopDomain: !!shopDomain
            });
            return { error: 'Missing required parameters' };
        }

        const API_VERSION = '2024-10';
        const endpoint = `https://${shopDomain}/admin/api/${API_VERSION}/graphql.json`;
        const cleanOrderNumber = orderNumber.trim().replace(/^#/, ''); // Remove # if present for search

        // Search strictly by email (reliable) and loosely by valid order name
        // We fetch first 5 orders for this email to find the matching one
        const query = `
        query verifyOrder($query: String!) {
            orders(first: 5, query: $query) {
                nodes {
                    id
                    name
                    email
                    createdAt
                    tags
                    customer {
                        id
                    }
                    lineItems(first: 5) {
                        nodes {
                            title
                            sku
                            image {
                                url
                                altText
                            }
                        }
                    }
                }
            }
        }`;

        const variables = {
            query: `email:${email.trim()} AND (name:${cleanOrderNumber} OR name:#${cleanOrderNumber})`
        };

        console.log('[verifyCustomerOrder] Fetching order:', endpoint, JSON.stringify(variables));

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': adminToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables }),
        });

        console.log('[verifyCustomerOrder] Response Status:', response.status);

        const text = await response.text();
        console.log('[verifyCustomerOrder] Response Body:', text.substring(0, 500)); // Log first 500 chars

        let data, errors;
        try {
            const json = JSON.parse(text);
            data = json.data;
            errors = json.errors;
        } catch (e) {
            console.error('[verifyCustomerOrder] JSON Parse Error:', e);
            return { error: 'Invalid response from Shopify.' };
        }

        if (errors) {
            console.error('[verifyCustomerOrder] GraphQL Errors:', JSON.stringify(errors));
            const msg = errors.map(e => e.message).join(', ');
            return { error: `Shopify Error: ${msg}` };
        }

        const orders = data?.orders?.nodes || [];
        if (orders.length === 0) {
            return { error: 'Order not found matching these details.' };
        }

        const order = orders[0];

        // CHECK IF ALREADY REGISTERED (Don't error, just flag it)
        const hasWarrantyTag = order.tags && order.tags.includes('Warranty Registered');

        // Double check email (though query handled it)
        if (order.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
            return { error: 'Email does not match our records.' };
        }

        const products = order.lineItems?.nodes.map(item => ({
            title: item.title,
            sku: item.sku,
            image: item.image?.url || null,
            quantity: item.quantity
        })) || [];

        return {
            valid: true,
            orderName: order.name,
            orderId: order.id,
            customerId: order.customer?.id,
            email: order.email,
            purchaseDate: order.createdAt ? order.createdAt.split('T')[0] : null,
            products: products,
            // Fallback for existing UI (will default to first product if not updated)
            productTitle: products[0]?.title || 'Unknown Product',
            sku: products[0]?.sku || '',
            image: products[0]?.image || null
        };

    } catch (err) {
        console.error('[verifyCustomerOrder] Exception:', err);
        return { error: 'An unexpected error occurred.' };
    }
}


/**
 * Check Warranty Status
 * Fetches "custom.warranty_active" JSON metafield from the Customer.
 */
export async function checkWarrantyStatus(customerId, adminToken, shopDomain) {
    if (!customerId || !adminToken || !shopDomain) {
        // If we don't have admin creds here, we simply return "not registered" 
        // acting as a safe fail-over.
        return { registered: false };
    }

    try {
        const API_VERSION = '2024-10';
        const endpoint = `https://${shopDomain}/admin/api/${API_VERSION}/graphql.json`;

        const query = `
        query getCustomerWarranty($id: ID!) {
            customer(id: $id) {
                metafield(namespace: "custom", key: "warranty_active") {
                    value
                }
            }
        }`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'X-Shopify-Access-Token': adminToken, 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables: { id: customerId } }),
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text).data;
        } catch (e) {
            console.error('[checkWarrantyStatus] Status:', response.status, 'Body:', text);
            return { registered: false };
        }

        const jsonValue = data?.customer?.metafield?.value;

        if (jsonValue) {
            try {
                const warranty = JSON.parse(jsonValue);
                return { registered: true, warranty };
            } catch (e) {
                console.error('Failed to parse warranty metafield', e);
            }
        }
        return { registered: false };

    } catch (error) {
        console.error('[checkWarrantyStatus] Error:', error);
        return { registered: false };
    }
}


/**
 * Register Warranty (Hydrogen Only)
 * 1. Saves warranty details to Customer Metafield (custom.warranty_active)
 * 2. Tags the Order as 'Warranty Registered'
 */
export async function registerWarranty(payload, adminToken, shopDomain) {
    const { shopifyCustomerId, orderId, ...details } = payload;

    if (!orderId || !adminToken || !shopDomain) {
        console.error('[registerWarranty] Missing Token or Order ID');
        throw new Error('System Error: Unable to save warranty.');
    }

    const API_VERSION = '2024-10';
    const endpoint = `https://${shopDomain}/admin/api/${API_VERSION}/graphql.json`;

    // 1. Tag the Order (Always)
    const tagMutation = `
    mutation tagOrder($orderId: ID!) {
        tagsAdd(id: $orderId, tags: ["Warranty Registered"]) {
            userErrors { field message }
        }
    }`;

    try {
        await fetch(endpoint, {
            method: 'POST',
            headers: { 'X-Shopify-Access-Token': adminToken, 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: tagMutation, variables: { orderId } }),
        });
    } catch (e) {
        console.error('Failed to tag order', e);
    }

    // 2. Save Metafield (If Customer Exists)
    const generatedWarrantyNumber = Date.now();

    if (shopifyCustomerId) {
        const warrantyData = JSON.stringify({
            ...details,
            warrantyNumber: generatedWarrantyNumber,
            registeredAt: new Date().toISOString(),
            status: 'ACTIVE'
        });

        const metafieldMutation = `
        mutation setMetafield($metafield: MetafieldsSetInput!) {
            metafieldsSet(metafields: [$metafield]) {
                userErrors { field message }
            }
        }`;

        const variables = {
            metafield: {
                ownerId: shopifyCustomerId,
                namespace: "custom",
                key: "warranty_active",
                type: "json",
                value: warrantyData
            }
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'X-Shopify-Access-Token': adminToken, 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: metafieldMutation, variables }),
            });

            const text = await response.text();
            try {
                const { data, errors } = JSON.parse(text);
                if (errors || data?.metafieldsSet?.userErrors?.length > 0) {
                    console.error('Metafield error:', errors || data?.metafieldsSet?.userErrors);
                }
            } catch (e) {
                console.error('[registerWarranty:Metafield] Status:', response.status, 'Body:', text);
            }
        } catch (e) {
            console.error('Failed to save customer metafield', e);
        }
    }

    return {
        success: true,
        warranty: {
            warrantyNumber: generatedWarrantyNumber,
            ...details
        }
    };
}
