import { createStorefrontClient, createCustomerAccountClient } from '@shopify/hydrogen';
import { createAppSession } from '~/lib/session.server';

export async function createAppLoadContext(request, env, executionContext) {
    /**
     * Open the cache.
     */
    const cache = await caches.open('hydrogen');
    const storage = createAppSession(env);


    // Create a simplified session wrapper for customerAccount
    const sessionInstance = await storage.getSession(request.headers.get('Cookie'));
    const session = {
        get: (key) => sessionInstance.get(key),
        set: (key, value) => sessionInstance.set(key, value),
        unset: (key) => sessionInstance.unset(key),
        commit: () => storage.commitSession(sessionInstance),
    };

    /**
     * Create Hydrogen's Storefront client.
     */
    const { storefront } = createStorefrontClient({
        cache,
        waitUntil: (p) => executionContext.waitUntil(p),
        i18n: { language: 'EN', country: 'US' },
        publicStorefrontToken: env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN,
        storeDomain: env.NEXT_PUBLIC_SHOPIFY_DOMAIN,
    });

    /**
     * Create Hydrogen's Customer Account client.
     */
    const customerAccount = createCustomerAccountClient({
        request,
        session,
        customerAccountId: (env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID || '').trim(),
        shopId: env.PUBLIC_CUSTOMER_ACCOUNT_ID,
        // customerAccountUrl removed to let Hydrogen use default API URL
    });

    return {
        cache,
        storefront,
        customerAccount,
        session,
        env,
    };
}
