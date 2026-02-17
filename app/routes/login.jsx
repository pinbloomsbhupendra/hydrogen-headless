import { Form, useActionData, useNavigation, useSearchParams } from 'react-router';
import { redirect } from 'react-router';

export async function loader({ context, request }) {
  if (await context.customerAccount.isLoggedIn()) {
    const url = new URL(request.url);
    const returnTo = url.searchParams.get('return_to');
    throw redirect(returnTo || '/account');
  }
  return null;
}

export async function action({ context, request }) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  try {
    if (intent === 'login') {
      const returnTo = formData.get('return_to');
      const email = formData.get('email');

      // 🚀 IMPORTANT: return directly, do NOT append cookies
      // 🚀 IMPORTANT: return directly, do NOT append cookies
      const response = await context.customerAccount.login({
        returnTo: returnTo || '/account',
        loginHint: email || undefined,
      });

      response.headers.append('Set-Cookie', await context.session.commit());

      return response;
    }

    if (intent === 'signup') {
      const returnTo = formData.get('return_to');

      const response = await context.customerAccount.login({
        returnTo: returnTo || '/account',
      });

      response.headers.append('Set-Cookie', await context.session.commit());

      return response;
    }

    throw new Error('Invalid intent');
  } catch (error) {
    if (error instanceof Response) {
      // It's a redirect, so re-throw it!
      throw error;
    }
    console.error('Auth error full:', error);
    if (error instanceof Error) {
      console.error('Auth error message:', error.message);
      console.error('Auth error stack:', error.stack);
    }
    return { error: `Authentication failed: ${error.message || 'Unknown error'}` };
  }
}

export default function Login() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const returnTo = searchParams.get('return_to');
  const isSubmitting = navigation.state === 'submitting';
  const error = actionData?.error;

  return (
    <div className="min-h-screen bg-[#b3b3b3] flex items-center justify-center py-12 px-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden bg-white">
        <div className="p-12 flex flex-col justify-center">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-red-600 mb-2 italic">
            Existing Member
          </h2>
          <h1 className="text-4xl font-black text-[#1a1a1a] italic skew-x-[-10deg] mb-6">
            SIGN IN
          </h1>

          <Form method="post" className="space-y-6">
            <input type="hidden" name="intent" value="login" />
            {returnTo && <input type="hidden" name="return_to" value={returnTo} />}

            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email address (optional)"
              className="w-full px-3 py-4 border border-gray-300 focus:ring-red-500 focus:border-red-500"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-5 font-black uppercase tracking-widest hover:bg-red-600 transition"
            >
              {isSubmitting ? 'Redirecting...' : 'Sign In'}
            </button>
          </Form>

          {error && (
            <p className="mt-4 text-red-600 font-bold text-center border-2 border-red-600 p-2 bg-red-50">
              {error}
            </p>
          )}
        </div>

        <div className="bg-[#1a1a1a] p-12 flex flex-col justify-center text-white">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-red-500 mb-2 italic">
            New Here?
          </h2>
          <h1 className="text-4xl font-black italic skew-x-[-10deg] mb-6">
            CREATE ACCOUNT
          </h1>

          <Form method="post">
            <input type="hidden" name="intent" value="signup" />
            {returnTo && <input type="hidden" name="return_to" value={returnTo} />}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full border-2 border-white/20 py-5 font-black uppercase tracking-widest hover:bg-white hover:text-black transition"
            >
              {isSubmitting ? 'Redirecting...' : 'Register Now'}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
