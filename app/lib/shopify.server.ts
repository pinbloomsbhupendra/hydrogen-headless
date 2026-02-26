import { createStorefrontClient } from '@shopify/hydrogen';

/**
 * Configure Hydrogen's Storefront client.
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables
 * @param {ExecutionContext} executionContext - The execution context
 */
export function createHydrogenContext(request, env, executionContext) {
    const { storefront } = createStorefrontClient({
        cache: caches.open('hydrogen'),
        waitUntil: (p) => executionContext.waitUntil(p),
        i18n: { language: 'EN', country: 'US' },
        publicStorefrontToken: env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        privateStorefrontToken: env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
        storeDomain: env.VITE_SHOPIFY_STORE_DOMAIN,
        storefrontId: env.SHOPIFY_STOREFRONT_ID,
        storefrontHeaders: {
            // 'buyer-ip': request.headers.get('buyer-ip'),
        },
    });

    return { storefront };
}
