import { Form, useActionData, useNavigation, useSearchParams } from 'react-router';
import { redirect, data } from 'react-router';
import { CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, CUSTOMER_CREATE_MUTATION } from '~/graphql/customer/mutations';

export async function loader({ context, request }) {
  const customerAccessToken = await context.session.get('customerAccessToken');
  if (customerAccessToken) {
    const url = new URL(request.url);
    const returnTo = url.searchParams.get('return_to');
    return redirect(returnTo || '/dashboard');
  }
  return null;
}

export async function action({ context, request }) {
  const formData = await request.formData();
  const intent = formData.get('intent');
  const { storefront, session } = context;

  try {
    if (intent === 'login') {
      const email = formData.get('email');
      const password = formData.get('password');
      const returnTo = formData.get('return_to') || '/dashboard';

      if (!email || !password) {
        return data({ error: 'Please provide both email and password.' }, { status: 400 });
      }

      const { customerAccessTokenCreate } = await storefront.mutate(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
        variables: {
          input: { email, password },
        },
      });

      if (customerAccessTokenCreate?.customerUserErrors?.length > 0) {
        return data({ error: customerAccessTokenCreate.customerUserErrors[0].message }, { status: 400 });
      }

      const { accessToken } = customerAccessTokenCreate.customerAccessToken;
      session.set('customerAccessToken', accessToken);

      return redirect(returnTo, {
        headers: {
          'Set-Cookie': await session.commit(),
        },
      });
    }

    if (intent === 'signup') {
      const email = formData.get('email');
      const password = formData.get('password');
      const firstName = formData.get('firstName');
      const lastName = formData.get('lastName');
      const returnTo = formData.get('return_to') || '/dashboard';

      if (!email || !password) {
        return data({ error: 'Email and password are required for signup.' }, { status: 400 });
      }

      const { customerCreate } = await storefront.mutate(CUSTOMER_CREATE_MUTATION, {
        variables: {
          input: { email, password, firstName, lastName },
        },
      });

      if (customerCreate?.customerUserErrors?.length > 0) {
        return data({ error: customerCreate.customerUserErrors[0].message }, { status: 400 });
      }

      // After signup, log them in automatically
      const { customerAccessTokenCreate } = await storefront.mutate(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
        variables: {
          input: { email, password },
        },
      });

      if (customerAccessTokenCreate?.customerAccessToken) {
        session.set('customerAccessToken', customerAccessTokenCreate.customerAccessToken.accessToken);
        return redirect(returnTo, {
          headers: {
            'Set-Cookie': await session.commit(),
          },
        });
      }

      return redirect('/login?registered=true');
    }

    throw new Error('Invalid intent');
  } catch (error) {
    console.error('Auth error:', error);
    return data({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}

export default function Login() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const returnTo = searchParams.get('return_to');
  const isSubmitting = navigation.state === 'submitting';
  const error = actionData?.error;
  const registered = searchParams.get('registered') === 'true';

  return (
    <div className="page-container-gray py-12">
      <div className="login-container">
        {/* Sign In Section */}
        <div className="p-10 md:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
          <div className="mb-10">
            <h2 className="text-prolock-red font-black uppercase tracking-[0.3em] text-xs mb-3 italic">
              Welcome Back
            </h2>
            <h1 className="italic-heading text-5xl text-prolock-black-alt">
              SIGN IN
            </h1>
            <p className="text-gray-500 font-medium tracking-tight">Access your Prolock account</p>
          </div>

          <Form method="post" className="space-y-5">
            <input type="hidden" name="intent" value="login" />
            {returnTo && <input type="hidden" name="return_to" value={returnTo} />}

            <div className="space-y-1">
              <label htmlFor="login-email" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                placeholder="email@example.com"
                className="form-input rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="login-password" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="form-input rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-form-submit py-5 rounded-xl shadow-black/10 mt-4"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </Form>

          {error && (
            <div className="mt-8 bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-prolock-red animate-pulse"></div>
              <p className="text-red-700 font-bold text-sm">{error}</p>
            </div>
          )}

          {registered && (
            <div className="mt-8 bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-600"></div>
              <p className="text-green-700 font-bold text-sm">Account created! Please sign in.</p>
            </div>
          )}
        </div>

        {/* Create Account Section */}
        <div className="join-prolock-section">
          {/* Subtle geometric background decoration */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-red-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-red-600/5 rounded-full blur-3xl"></div>

          <div className="mb-10 relative z-10">
            <h2 className="text-prolock-red font-black uppercase tracking-[0.3em] text-xs mb-3 italic">
              New Member
            </h2>
            <h1 className="italic-heading text-5xl text-white">
              JOIN PRO<span className="text-prolock-red">LOCK</span>
            </h1>
            <p className="text-white/80 font-medium tracking-tight">Register for exclusive benefits</p>
          </div>

          <Form method="post" className="space-y-4 relative z-10">
            <input type="hidden" name="intent" value="signup" />
            {returnTo && <input type="hidden" name="return_to" value={returnTo} />}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="signup-firstName" className="text-[10px] font-bold text-white/70 uppercase tracking-widest pl-1">First Name</label>
                <input
                  id="signup-firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  className="form-input-dark"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="signup-lastName" className="text-[10px] font-bold text-white/70 uppercase tracking-widest pl-1">Last Name</label>
                <input
                  id="signup-lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  className="form-input-dark"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="signup-email" className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                placeholder="email@example.com"
                className="form-input-dark"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="signup-password" className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="form-input-dark"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-white mt-4"
            >
              {isSubmitting ? 'Registering...' : 'Create Account'}
            </button>
          </Form>

          <p className="mt-8 text-white/50 text-[10px] font-medium text-center relative z-10 leading-relaxed">
            By creating an account, you agree to our <br />
            <a href="/policies/terms-of-service" className="text-white/80 underline hover:text-prolock-red transition-colors">Terms of Service</a> and <a href="/policies/privacy-policy" className="text-white/80 underline hover:text-prolock-red transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
