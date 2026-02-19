import { redirect, Form, useActionData, useLoaderData, useNavigation } from 'react-router';
import { CUSTOMER_QUERY } from '~/graphql/customer/queries';

export async function loader({ context }) {
    const customerAccessToken = await context.session.get('customerAccessToken');

    if (!customerAccessToken) {
        return redirect('/login');
    }

    const { customer } = await context.storefront.query(CUSTOMER_QUERY, {
        variables: { customerAccessToken },
        cache: context.storefront.CacheNone(),
    });

    if (!customer) {
        return redirect('/login');
    }

    return { customer };
}

export async function action({ request, context }) {
    // Profile update via Storefront API requires customerUpdate mutation
    // For now, redirect to dashboard
    return redirect('/dashboard');
}


export default function CompleteProfile() {
    const { customer } = useLoaderData();
    const actionData = useActionData();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    return (
        <div className="min-h-screen bg-[#b3b3b3] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl">
                <div className="mb-8 text-center">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-red-600 mb-2 italic">
                        Almost There
                    </h2>
                    <h1 className="text-3xl font-black text-[#1a1a1a] italic skew-x-[-10deg] leading-none mb-4">
                        COMPLETE PROFILE
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Please confirm your details to finish setting up your account.
                    </p>
                </div>

                <Form method="post" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="sr-only">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                id="firstName"
                                defaultValue={customer?.firstName}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm font-medium"
                                placeholder="First Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="sr-only">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                id="lastName"
                                defaultValue={customer?.lastName}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm font-medium"
                                placeholder="Last Name"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="phoneNumber" className="sr-only">Mobile Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            id="phoneNumber"
                            defaultValue={customer?.phoneNumber?.phoneNumber}
                            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm font-medium"
                            placeholder="Mobile Number"
                        />
                    </div>

                    {/* Address Fields - Simplified for now to ensure visual completeness */}
                    <div>
                        <label htmlFor="address1" className="sr-only">Address</label>
                        <input
                            type="text"
                            name="address1"
                            id="address1"
                            defaultValue={customer?.defaultAddress?.address1}
                            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm font-medium"
                            placeholder="Street Address"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="city"
                            defaultValue={customer?.defaultAddress?.city}
                            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm font-medium"
                            placeholder="City"
                        />
                        <input
                            type="text"
                            name="state"
                            defaultValue={customer?.defaultAddress?.province}
                            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm font-medium"
                            placeholder="State/Province"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="zip"
                            defaultValue={customer?.defaultAddress?.zip}
                            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm font-medium"
                            placeholder="ZIP / Postal Code"
                        />
                        <input
                            type="text"
                            name="country"
                            defaultValue={customer?.defaultAddress?.country || 'Australia'}
                            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm font-medium"
                            placeholder="Country"
                        />
                    </div>


                    {actionData?.error && (
                        <div className="text-red-600 text-sm font-bold text-center bg-red-50 p-2 border border-red-200">
                            {actionData.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-black uppercase tracking-widest text-white bg-black hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Save & Continue'}
                    </button>
                </Form>
            </div>
        </div>
    );
}
