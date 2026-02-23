import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
  data,
} from 'react-router';
import { useState, useEffect, useRef } from 'react';
import customStyles from './styles/custom.css?url';
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import CookieConsent from '~/components/CookieConsent';
import CartDrawer from '~/components/Cart/CartDrawer';

export async function loader({ request, context }) {
  const { cart, session } = context;
  const cartId = session.get('cartId');
  console.log('[Root Loader] Session Cart ID:', cartId);

  const cartData = await cart.get();
  console.log('[Root Loader] Cart Data:', cartData ? `ID: ${cartData.id}, Qty: ${cartData.totalQuantity}` : 'None or Failed');

  return {
    cartData: cartData,
  };
}

export function links() {
  return [
    { rel: 'stylesheet', href: customStyles },
    { rel: 'icon', type: 'image/png', href: '/logo.png' },
  ];
}

export default function App() {
  const { cartData } = useLoaderData();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Auto-open cart when an item is added
  const cartCount = cartData?.totalQuantity || 0;
  const cartId = cartData?.id;
  const prevCartId = useRef(cartId);
  const prevCartCount = useRef(cartCount);

  useEffect(() => {
    // If cart ID changed (new cart created) or count increased, open the drawer
    const isNewCart = cartId && prevCartId.current && cartId !== prevCartId.current;
    const isCountIncreased = cartCount > prevCartCount.current;

    // Also trigger if it's the very first time an item is added to a brand new cart
    const isFirstItem = cartCount > 0 && !prevCartId.current && cartId;

    if (isNewCart || isCountIncreased || isFirstItem) {
      setIsCartOpen(true);
    }

    prevCartId.current = cartId;
    prevCartCount.current = cartCount;
  }, [cartId, cartCount]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Navbar
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
        />
        <main>
          <Outlet />
        </main>
        <Footer />
        <CookieConsent />
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cartData}
        />

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function shouldRevalidate({ formMethod, defaultShouldRevalidate, currentUrl, nextUrl }) {
  // Always revalidate after a mutation (POST, PUT, DELETE)
  if (formMethod && formMethod !== 'GET') {
    return true;
  }

  // For navigation (GET requests), rely on default behavior 
  // which re-runs loaders if params change or if not caught by cache
  return defaultShouldRevalidate;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const isRouteError = isRouteErrorResponse(error);
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteError) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="page-container-gray">
          <div className="form-card max-w-md text-center">
            <h1 className="text-3xl font-bold text-prolock-black mb-2">Oops!</h1>
            <p className="text-lg text-gray-600 mb-6">{errorMessage}</p>
            <a href="/" className="btn-form-submit inline-block text-center">
              Return to Home
            </a>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
