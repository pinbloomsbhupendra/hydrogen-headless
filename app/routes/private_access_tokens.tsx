/**
 * Stub route for private_access_tokens
 * This route is used by the Shopify Customer Account API (OIDC).
 * Since we are using the Storefront API for customer login, we stub this out
 * to prevent 401 console errors from the internal Hydrogen/Shopify scripts.
 */

export async function loader() {
    return new Response(JSON.stringify({}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function action() {
    return new Response(JSON.stringify({}), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export default function PrivateAccessTokens() {
    return null;
}
