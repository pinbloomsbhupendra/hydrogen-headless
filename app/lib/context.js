import {
  createStorefrontClient,
  createCustomerAccountClient,
} from '@shopify/hydrogen';
import { createAppSession } from '~/lib/session.server';

export async function createAppLoadContext(request, env, executionContext) {
  const cache = await caches.open('hydrogen');

  const storage = createAppSession(env);

  const sessionInstance = await storage.getSession(
    request.headers.get('Cookie'),
  );

  const session = {
    get: (key) => sessionInstance.get(key),
    set: (key, value) => sessionInstance.set(key, value),
    unset: (key) => sessionInstance.unset(key),
    commit: () => storage.commitSession(sessionInstance),
  };

  /**
   * Storefront client
   */
  const { storefront } = createStorefrontClient({
    cache,
    waitUntil: (p) => executionContext.waitUntil(p),
    i18n: { language: 'EN', country: 'US' },
    publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
    storeDomain: env.PUBLIC_STORE_DOMAIN,
  });



  const customerAccount = createCustomerAccountClient({
    request,
    session,
    customerAccountId: env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID || '66d66652-1c70-46d2-a717-1a0177147762',
    customerAccountUrl: env.PUBLIC_CUSTOMER_ACCOUNT_API_URL || 'https://shopify.com/80392814850',
    shopId: env.SHOP_ID || '80392814850',
  });

  return {
    cache,
    storefront,
    customerAccount,
    session,
    env,
  };
}
