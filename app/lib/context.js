import {
  createStorefrontClient,
  createCustomerAccountClient,
  createCartHandler,
} from '@shopify/hydrogen';
import { createAppSession } from '~/lib/session.server';
import { CART_QUERY_FRAGMENT } from '~/graphql/cart/queries';

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
    // Using private token as public token is unauthorized
    privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
    storeDomain: env.PUBLIC_STORE_DOMAIN || 'iqwxvr-b0.myshopify.com',
  });



  const customerAccount = createCustomerAccountClient({
    request,
    session,
    customerAccountId: env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID || '66d66652-1c70-46d2-a717-1a0177147762',
    customerAccountUrl: env.PUBLIC_CUSTOMER_ACCOUNT_API_URL || 'https://shopify.com/80392814850',
    shopId: env.SHOP_ID || '80392814850',
  });

  const cart = createCartHandler({
    storefront,
    customerAccount,
    session,
    cartQueryFragment: CART_QUERY_FRAGMENT,
    getCartId: () => session.get('cartId'),
    setCartId: (cartId) => session.set('cartId', cartId),
  });

  return {
    cache,
    storefront,
    customerAccount,
    cart,
    session,
    env,
  };
}
