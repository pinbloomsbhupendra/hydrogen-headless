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
  Await,
} from 'react-router';
import { useState, useEffect, useRef, Suspense } from 'react';
import globalStyles from './styles/global.css?url';
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import CookieConsent from '~/components/CookieConsent';
import CartDrawer from '~/components/Cart/CartDrawer';

export async function loader({ request, context }) {
  const { cart, session } = context;
  const cartId = session.get('cartId');
  console.log('[Root Loader] Session Cart ID:', cartId);

  // In React Router 7, returning a promise directly enables deferred streaming
  return {
    cartData: cart.get(),
  };
}

export function links() {
  return [
    { rel: 'stylesheet', href: globalStyles },
    { rel: 'icon', type: 'image/png', href: '/logo.png' },
  ];
}

function CartStateContainer({ resolvedCartData }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartCount = resolvedCartData?.totalQuantity || 0;
  const cartId = resolvedCartData?.id;

  const prevCartId = useRef(cartId);
  const prevCartCount = useRef(cartCount);

  useEffect(() => {
    // If cart ID changed (new cart created) or count increased, open the drawer
    const isNewCart = cartId && prevCartId.current && cartId !== prevCartId.current;
    const isCountIncreased = cartCount > prevCartCount.current;
    const isFirstItem = cartCount > 0 && !prevCartId.current && cartId;

    if (isNewCart || isCountIncreased || isFirstItem) {
      setIsCartOpen(true);
    }

    prevCartId.current = cartId;
    prevCartCount.current = cartCount;
  }, [cartId, cartCount]);

  return (
    <>
      <Navbar
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={resolvedCartData}
      />
    </>
  );
}

export default function App() {
  const { cartData } = useLoaderData();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <Suspense fallback={<Navbar cartCount={0} onCartClick={() => { }} />}>
          <Await resolve={cartData}>
            {(resolvedCartData) => <CartStateContainer resolvedCartData={resolvedCartData} />}
          </Await>
        </Suspense>
        <main>
          <Outlet />
        </main>
        <Footer />
        <CookieConsent />

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 font-sans p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center border border-red-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops!</h1>
            <p className="text-lg text-gray-600 mb-6">{errorMessage}</p>
            <a href="/" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 w-full transition-colors">
              Return to Home
            </a>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
