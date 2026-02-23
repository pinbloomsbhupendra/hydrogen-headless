import { redirect, Form, useLoaderData, useNavigation } from 'react-router';
import { CUSTOMER_QUERY } from '~/graphql/customer/queries';

/**
 * Account Page Loader
 * Checks if the user is already logged in via session token.
 */
export async function loader({ context }) {
    const customerAccessToken = await context.session.get('customerAccessToken');

    if (!customerAccessToken) {
        throw redirect('/login');
    }

    const { customer } = await context.storefront.query(CUSTOMER_QUERY, {
        variables: { customerAccessToken },
        cache: context.storefront.CacheNone(),
    });

    if (!customer) {
        throw redirect('/login');
    }

    return { customer };
}

/**
 * Account Page Action
 * Handles logout redirect.
 */
export async function action({ context }) {
    const { session } = context;
    session.unset('customerAccessToken');
    return redirect('/login', {
        headers: { 'Set-Cookie': await session.commit() },
    });
}

export default function Account() {
    const { customer } = useLoaderData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    return (
        <div className="page-container-gray py-20 px-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                {/* Sidebar / Info */}
                <div className="sidebar-dark md:w-1/3 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-prolock-red mb-2 italic">Active Profile</h2>
                        <h1 className="italic-heading text-3xl leading-none">
                            {customer.firstName} {customer.lastName}
                        </h1>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/20">
                        <p className="text-xs opacity-50 uppercase tracking-widest mb-4">Account Security</p>
                        <p className="font-mono text-sm opacity-80">{customer.email}</p>
                        {customer.phone && (
                            <p className="font-mono text-sm opacity-80 mt-1">{customer.phone}</p>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-12 md:w-2/3 bg-white">
                    <h2 className="text-2xl font-black text-prolock-black-alt mb-8 uppercase italic border-b-4 border-prolock-red inline-block pb-2">
                        User Dashboard
                    </h2>

                    <div className="grid grid-cols-1 gap-6">
                        <a href="/dashboard" className="account-action-card group">
                            <h3 className="font-black text-xl uppercase italic group-hover:text-prolock-red transition-colors">View Dashboard →</h3>
                            <p className="text-gray-500 mt-2 font-medium">See your active warranties and product details.</p>
                        </a>

                        <a href="/register-warranty" className="account-action-card group">
                            <h3 className="font-black text-xl uppercase italic group-hover:text-prolock-red transition-colors">Register New Warranty →</h3>
                            <p className="text-gray-500 mt-2 font-medium">Register your ProLock and view coverage status.</p>
                        </a>

                        <div className="account-action-card-disabled">
                            <h3 className="font-black text-xl uppercase italic">Order History</h3>
                            <p className="text-gray-500 mt-2 font-medium">Recent purchase history (Coming Soon).</p>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center justify-between">
                        <Form action="/logout" method="POST">
                            <button
                                className="btn-checkout px-12 py-3 rounded text-sm font-black uppercase transition-all disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Signing Out...' : 'Sign Out'}
                            </button>
                        </Form>
                        <p className="text-xs text-gray-400 font-bold italic uppercase">ProLock Security System v1.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
