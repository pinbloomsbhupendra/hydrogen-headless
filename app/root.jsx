/**
 * Root Application Component
 * 
 * Main entry point for the Prolock Hydrogen storefront.
 * Sets up the HTML document structure, global styles, and layout.
 * 
 * @module root
 */

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router';
import { getCart } from './lib/cart.server';
import globalStyles from './styles/global.css?url';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import CookieBanner from './components/cookie/cookie';

/**
 * Links Function
 * 
 * Defines stylesheet and favicon links for the application.
 * Called by React Router to inject links into the document head.
 * 
 * @returns {Array<Object>} Array of link objects for stylesheets and icons
 */
export async function loader({ context }) {
  const cart = await getCart(context.request, context);
  return { cart };
}

export function links() {
  return [
    { rel: 'stylesheet', href: globalStyles },
    { rel: 'icon', type: 'image/png', href: '/logo.png' },
  ];
}

/**
 * App Component
 * 
 * Root component that renders the HTML document structure.
 * Layout includes:
 * - Header (sticky navigation)
 * - Main content area (route-specific content via Outlet)
 * - Footer (site-wide footer)
 * 
 * @component
 * @returns {JSX.Element} The complete HTML document structure
 */
/**
 * Layout Component
 * 
 * Provides the base HTML structure and global components (Header, Footer).
 * Wraps all route components and the ErrorBoundary.
 */
export function Layout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * App Component
 * 
 * The root route component. Fetches global data (like cart) and defines the layout.
 */
export default function App() {
  const data = useLoaderData();
  const cart = data?.cart;

  return (
    <>
      {/* Global Header - Sticky navigation with logo and cart */}
      <Header cartCount={cart?.totalQuantity || 0} />

      {/* Main Content Area - Route-specific content rendered here */}
      <main>
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />

      <CookieBanner />
    </>
  );
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 font-sans p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center border border-red-100">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-6">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops!</h1>
        <p className="text-lg text-gray-600 mb-6">Something went wrong.</p>

        <div className="bg-red-50 rounded-md p-4 mb-6 text-left overflow-auto max-h-48">
          <p className="text-sm font-mono text-red-800 break-words">
            {errorStatus && <span className="font-bold block mb-1">Status: {errorStatus}</span>}
            {errorMessage}
          </p>
        </div>

        <a href="/" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 w-full transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
}
