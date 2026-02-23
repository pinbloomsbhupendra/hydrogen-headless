import {
  createStorefrontClient,
  createCustomerAccountClient,
  createCartHandler,
} from '@shopify/hydrogen';
import { createAppSession } from '~/lib/session.server';
import { CART_QUERY_FRAGMENT } from '~/graphql/cart/queries';

/**
 * The Load Context is where you define any reusable services or clients
 * available to all loaders and actions.
 */
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

  // Basic locale detection from URL (e.g., /en-in -> language: EN, country: IN)
  const url = new URL(request.url);
  const firstPathSegment = url.pathname.split('/')[1] || '';
  let language = 'EN';
  let country = 'US';

  if (/^[a-zA-Z]{2}-[a-zA-Z]{2}$/.test(firstPathSegment)) {
    const pathParts = firstPathSegment.split('-');
    language = pathParts[0].toUpperCase();
    country = pathParts[1].toUpperCase();
  } else if (/^[a-zA-Z]{2}$/.test(firstPathSegment)) {
    country = firstPathSegment.toUpperCase();
  }

  /**
   * Storefront client
   * Uses PRIVATE_STOREFRONT_API_TOKEN for server-side requests.
   */
  const { storefront } = createStorefrontClient({
    cache,
    waitUntil: (p) => executionContext.waitUntil(p),
    i18n: { language, country: country.length === 2 ? country : 'US' },
    publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
    privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
    storeDomain: env.PUBLIC_STORE_DOMAIN,
    storefrontId: env.PUBLIC_STOREFRONT_ID,
  });

  /**
   * Customer Account client
   * Commented out to prevent 401 errors on /private_access_tokens
   * as the app uses Storefront API for authentication.
   */
  /*
  const customerAccount = createCustomerAccountClient({
    request,
    session,
    customerAccountId: env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
    customerAccountUrl: env.PUBLIC_CUSTOMER_ACCOUNT_API_URL,
    shopId: env.SHOP_ID,
  });
  */

  /**
   * Cart Handler
   */
  const cart = createCartHandler({
    storefront,
    // customerAccount,
    session,
    cartQueryFragment: CART_QUERY_FRAGMENT,
    getCartId: () => session.get('cartId'),
    setCartId: (cartId) => session.set('cartId', cartId),
  });

  return {
    cache,
    storefront,
    // customerAccount,
    cart,
    session,
    env,
    waitUntil: executionContext.waitUntil.bind(executionContext),
  };
}
