import { Form, useActionData, useNavigation, useSearchParams } from 'react-router';
import { redirect } from 'react-router';

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
 * Handles both "login" and "signup" (registration) via the Customer Account API.
 *
 * - intent = "login"  → normal sign‑in flow
 * - intent = "signup" → registration flow using acrValues
 *
 * This MUST return the Response from context.customerAccount.login()
 * so Remix/Hydrogen can perform the redirect to Shopify's hosted login.
 */
export async function action({ context, request }) {
    const formData = await request.formData();
    const intent = formData.get('intent');

    try {
        let response;

        console.log(`Initiating Shopify ${intent}...`);

        if (intent === 'login') {
            const returnTo = formData.get('return_to');
            const email = formData.get('email');
            // Normal login
            response = await context.customerAccount.login({
                // Where the customer ends up after the full OAuth flow
                returnTo: returnTo || '/account',
                // Optional: Hint the email to the identity provider
                loginHint: email || undefined,
            });
        } else if (intent === 'signup') {
            const returnTo = formData.get('return_to');
            // Registration flow: standard login screen (let user switch to 'Sign up')
            response = await context.customerAccount.login({
                returnTo: returnTo || '/account',
            });
        } else {
            throw new Error('Invalid intent');
        }

        if (!response) {
            throw new Error('Login response is undefined');
        }

        console.log('Redirect URL:', response.headers.get('Location'));

        // Commit session so the customer tokens are persisted
        const setCookieHeader = await context.session.commit();
        response.headers.append('Set-Cookie', setCookieHeader);

        // IMPORTANT: Return the Response from customerAccount.login()
        return response;
    } catch (error) {
        console.error('Auth error detailed:', error);

        let errorMessage = 'Authentication failed';
        if (error instanceof Error) {
            errorMessage = `${error.name}: ${error.message}`;
        } else if (typeof error === 'object' && error !== null) {
            errorMessage = JSON.stringify(error, null, 2);
        } else {
            errorMessage = String(error);
        }

        // Return data so useActionData() can show the error message
        return { error: errorMessage };
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

                    <p className="text-gray-500 mb-10 leading-relaxed">
                        Access your account to manage your ProLock warranties and view order details.
                    </p>

                    <Form method="post" className="space-y-6">
                        <input type="hidden" name="intent" value="login" />
                        {returnTo && <input type="hidden" name="return_to" value={returnTo} />}

                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="Email address (optional)"
                                className="appearance-none rounded-none relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white py-5 px-8 font-black uppercase tracking-widest text-lg hover:bg-red-600 transition-all duration-300 transform hover:-translate-y-1 shadow-lg disabled:opacity-50"
                        >
                            {isSubmitting ? 'Redirecting to Shopify...' : 'Sign In'}
                        </button>
                    </Form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Use your email to sign in via verification code, or sign in with Shop.
                        </p>
                    </div>

                    {error && (
                        <p className="mt-4 text-red-600 font-bold text-center border-2 border-red-600 p-2 italic bg-red-50">
                            {error}
                        </p>
                    )}
                </div>

                {/* SIGNUP SECTION */}
                <div className="bg-[#1a1a1a] p-12 flex flex-col justify-center relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 opacity-10 translate-x-1/2 -translate-y-1/2 blur-3xl" />

                    <div className="relative z-10">
                        <div className="mb-8">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-red-500 mb-2 italic">
                                New Here?
                            </h2>
                            <h1 className="text-4xl font-black text-white italic skew-x-[-10deg] leading-none mb-4">
                                CREATE ACCOUNT
                            </h1>
                        </div>

                        <p className="text-gray-400 mb-10 leading-relaxed">
                            Join the ProLock community today. Register your product within 12 months of purchase
                            to unlock up to $2000 of excess cover.
                        </p>

                        <Form method="post">
                            <input type="hidden" name="intent" value="signup" />
                            {returnTo && <input type="hidden" name="return_to" value={returnTo} />}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full border-2 border-white/20 text-white py-5 px-8 font-black uppercase tracking-widest text-lg hover:bg-white hover:text-black transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Redirecting...' : 'Register Now'}
                            </button>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}
