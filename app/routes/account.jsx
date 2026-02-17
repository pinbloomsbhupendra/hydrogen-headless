import { redirect, Form, useLoaderData, useNavigation } from 'react-router';

/**
 * Account Page Loader
 * Checks if the user is already logged in.
 */
export async function loader({ context }) {
    const isLoggedIn = await context.customerAccount.isLoggedIn();

    if (!isLoggedIn) {
        throw redirect('/login');
    }

    const { data } = await context.customerAccount.query(CUSTOMER_QUERY);
    const customer = data?.customer;
    return { customer };
}

const CUSTOMER_QUERY = `#graphql
  query AccountCustomerDetails {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
      defaultAddress {
        address1
        address2
        city
        province
        zip
        country
      }
    }
  }
`;

/**
 * Account Page Action
 * Handles the login trigger.
 */
export async function action({ context }) {
    try {
        console.log('Initiating Shopify Login...');
        return await context.customerAccount.login();
    } catch (error) {
        console.error('Account action error:', error);
        return { error: error.message || 'Login initialization failed.' };
    }
}

export default function Account() {
    const { customer } = useLoaderData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    return (
        <div className="min-h-screen bg-gray-200 flex flex-col items-center py-20 px-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                {/* Sidebar / Info */}
                <div className="bg-black text-white p-12 md:w-1/3 flex flex-col justify-between">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-red-600 mb-2 italic">Active Profile</h2>
                        <h1 className="text-3xl font-black italic skew-x-[-10deg] leading-none">
                            {customer.firstName} {customer.lastName}
                        </h1>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/20">
                        <p className="text-xs opacity-50 uppercase tracking-widest mb-4">Account Security</p>
                        <p className="font-mono text-sm opacity-80">{customer.emailAddress?.emailAddress}</p>
                        {customer.phoneNumber?.phoneNumber && (
                            <p className="font-mono text-sm opacity-80 mt-1">{customer.phoneNumber.phoneNumber}</p>
                        )}

                        {customer.defaultAddress && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-xs opacity-50 uppercase tracking-widest mb-2">Primary Address</p>
                                <div className="font-mono text-sm opacity-80 whitespace-pre-line">
                                    {customer.defaultAddress.address1}
                                    {customer.defaultAddress.address2 ? `\n${customer.defaultAddress.address2}` : ''}
                                    {`\n${customer.defaultAddress.city}, ${customer.defaultAddress.province} ${customer.defaultAddress.zip}`}
                                    {`\n${customer.defaultAddress.country}`}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-12 md:w-2/3 bg-white">
                    <h2 className="text-2xl font-black text-[#1a1a1a] mb-8 uppercase italic border-b-4 border-red-600 inline-block pb-2">
                        User Dashboard
                    </h2>

                    <div className="grid grid-cols-1 gap-6">
                        <a href="/dashboard" className="group border-4 border-gray-100 p-8 rounded-xl hover:border-red-600 transition-all bg-gray-50 hover:bg-white">
                            <h3 className="font-black text-xl uppercase italic group-hover:text-red-600 transition-colors">View Dashboard →</h3>
                            <p className="text-gray-500 mt-2 font-medium">See your active warranties and product details.</p>
                        </a>

                        <a href="/register-warranty" className="group border-4 border-gray-100 p-8 rounded-xl hover:border-red-600 transition-all bg-gray-50 hover:bg-white">
                            <h3 className="font-black text-xl uppercase italic group-hover:text-red-600 transition-colors">Register New Warranty →</h3>
                            <p className="text-gray-500 mt-2 font-medium">Register your ProLock and view coverage status.</p>
                        </a>

                        <div className="border-4 border-gray-100 p-8 rounded-xl opacity-40 bg-gray-50">
                            <h3 className="font-black text-xl uppercase italic">Order History</h3>
                            <p className="text-gray-500 mt-2 font-medium">Recent purchase history (Coming Soon).</p>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center justify-between">
                        <Form action="/logout" method="POST">
                            <button
                                className="bg-gray-100 px-6 py-3 rounded text-sm font-black uppercase hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
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
