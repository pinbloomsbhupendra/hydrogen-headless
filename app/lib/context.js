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

  console.log('Context Load - ClientID:', env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID);
  console.log('Context Load - ApiURL:', env.PUBLIC_CUSTOMER_ACCOUNT_API_URL);

  const customerAccount = createCustomerAccountClient({
    request,
    session,
    clientId: env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
    customerAccountApiUrl: env.PUBLIC_CUSTOMER_ACCOUNT_API_URL,
  });

  return {
    cache,
    storefront,
    customerAccount,
    session,
    env,
  };
}
