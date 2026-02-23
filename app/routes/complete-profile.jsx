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
        <div className="page-container-gray py-12">
            <div className="form-card max-w-md mx-auto">
                <div className="mb-8 text-center">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-prolock-red mb-2 italic">
                        Almost There
                    </h2>
                    <h1 className="italic-heading text-3xl text-prolock-black-alt">
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
                                className="form-input"
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
                                className="form-input"
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
                            className="form-input"
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
                            className="form-input"
                            placeholder="Street Address"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="city"
                            defaultValue={customer?.defaultAddress?.city}
                            className="form-input"
                            placeholder="City"
                        />
                        <input
                            type="text"
                            name="state"
                            defaultValue={customer?.defaultAddress?.province}
                            className="form-input"
                            placeholder="State/Province"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="zip"
                            defaultValue={customer?.defaultAddress?.zip}
                            className="form-input"
                            placeholder="ZIP / Postal Code"
                        />
                        <input
                            type="text"
                            name="country"
                            defaultValue={customer?.defaultAddress?.country || 'Australia'}
                            className="form-input"
                            placeholder="Country"
                        />
                    </div>


                    {actionData?.error && (
                        <div className="text-prolock-red text-sm font-bold text-center bg-red-50 p-2 border border-red-200">
                            {actionData.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-form-submit py-3"
                    >
                        {isSubmitting ? 'Saving...' : 'Save & Continue'}
                    </button>
                </Form>
            </div>
        </div>
    );
}
