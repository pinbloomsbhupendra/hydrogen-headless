import {
  Form,
  useActionData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import { redirect } from '@shopify/remix-oxygen';

/**
 * Loader:
 * If the customer is already logged in, redirect them to /account.
 */
export async function loader({ context, request }) {
  if (await context.customerAccount.isLoggedIn()) {
    const url = new URL(request.url);
    const returnTo = url.searchParams.get('return_to');
    throw redirect(returnTo || '/account');
  }
  return null;
}

/**
 * Action:
 * Handles both login & signup via Customer Account API
 */
export async function action({ context, request }) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  try {
    let response;

    if (intent === 'login') {
      const returnTo = formData.get('return_to');
      const email = formData.get('email');

      response = await context.customerAccount.login({
        returnTo: returnTo || '/account',
        loginHint: email || undefined,
      });
    } else if (intent === 'signup') {
      const returnTo = formData.get('return_to');

      response = await context.customerAccount.login({
        returnTo: returnTo || '/account',
      });
    } else {
      throw new Error('Invalid intent');
    }

    if (!response) {
      throw new Error('Login response is undefined');
    }

    // Persist session cookies
    const setCookieHeader = await context.session.commit();
    response.headers.append('Set-Cookie', setCookieHeader);

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return { error: 'Authentication failed. Please try again.' };
  }
}

/**
 * Login page UI
 */
export default function Login() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return_to');
  const isSubmitting = navigation.state === 'submitting';
  const error = actionData?.error;

  return (
    <div className="min-h-screen bg-[#b3b3b3] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
        {/* LOGIN SECTION */}
        <div className="p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-red-600 mb-2 italic">
              Existing Member
            </h2>
            <h1 className="text-4xl font-black text-[#1a1a1a] italic skew-x-[-10deg] leading-none mb-4">
              SIGN IN
            </h1>
          </div>

          <Form method="post" className="space-y-6">
            <input type="hidden" name="intent" value="login" />
            {returnTo && (
              <input type="hidden" name="return_to" value={returnTo} />
            )}

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email address (optional)"
              className="w-full px-3 py-4 border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-5 px-8 font-black uppercase tracking-widest text-lg hover:bg-red-600 transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? 'Redirecting to Shopify...' : 'Sign In'}
            </button>
          </Form>

          {error && (
            <p className="mt-4 text-red-600 font-bold text-center border-2 border-red-600 p-2 italic bg-red-50">
              {error}
            </p>
          )}
        </div>

        {/* SIGNUP SECTION */}
        <div className="bg-[#1a1a1a] p-12 flex flex-col justify-center text-white">
          <h1 className="text-4xl font-black italic mb-6">CREATE ACCOUNT</h1>

          <Form method="post">
            <input type="hidden" name="intent" value="signup" />
            {returnTo && (
              <input type="hidden" name="return_to" value={returnTo} />
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full border-2 border-white/20 text-white py-5 px-8 font-black uppercase tracking-widest text-lg hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? 'Redirecting...' : 'Register Now'}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
