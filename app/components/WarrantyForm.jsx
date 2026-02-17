import { Form, useNavigation, Link } from 'react-router';
import { useState, useEffect } from 'react';

export default function WarrantyForm({ actionData, productData, customerId, serial: initialSerial }) {
    const navigation = useNavigation();
    const [serial, setSerial] = useState((initialSerial || '').toUpperCase());
    const [mounted, setMounted] = useState(false);
    const [iframeHeight, setIframeHeight] = useState(950); // Default height

    useEffect(() => {
        setMounted(true);

        const handleMessage = (event) => {
            // Verify origin - helpful for security, though HubSpot forms can come from multiple subdomains
            // We'll check if it looks like a HubSpot form message
            if (event.origin.includes('hsforms.com') || event.origin.includes('hubspot.com')) {
                const data = event.data;
                // console.log('HubSpot Message:', data); // Debugging - typically verbose

                // Handle dynamic resizing
                // HubSpot sends { type: 'hsFormCallback', eventName: 'onFormReady', data: { height: ... } }

                // 1. Success Handling: Shrink iframe
                // Check for 'onFormSubmitted' or 'onFormSubmit'
                if (data?.type === 'hsFormCallback' && (data?.eventName === 'onFormSubmitted' || data?.eventName === 'onFormSubmit')) {
                    console.log('Form Submitted - Shrinking iframe');
                    setIframeHeight(300); // Approximate height for "Thank You" message
                }

                // 2. Dynamic Height Handling
                // Specific resizing event from HubSpot OR just a raw height update
                if (data?.type === 'hsFormCallback' && (data?.eventName === 'onFormReady' || data?.eventName === 'onFormResize')) {
                    if (data.data?.height) {
                        // Only update if we haven't just submitted (to avoid growing back)
                        // But actually, if the content changes to "Thank you", the height *should* come through as small.
                        // Let's trust the height if it's sent, but maybe add a buffer.
                        setIframeHeight(parseFloat(data.data.height) + 20);
                    }
                }

                // Fallback: some embeds send just the height as a number or string
                if (typeof data === 'number' && data > 100) {
                    setIframeHeight(data);
                } else if (typeof data === 'string' && !isNaN(parseFloat(data)) && parseFloat(data) > 100) {
                    setIframeHeight(parseFloat(data));
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const isVerifying = navigation.state === 'submitting' && navigation.formData?.get('actionType') === 'verify';
    const isRegistering = navigation.state === 'submitting' && navigation.formData?.get('actionType') === 'register';

    // If already registered
    if (actionData?.registered || actionData?.warranty) {
        const warranty = actionData.warranty;
        return (
            <div className="bg-white p-12 rounded-lg shadow-lg border-t-4 border-red-600 w-full max-w-2xl text-center">
                <div className="text-6xl mb-6">🎉</div>
                <h3 className="text-3xl font-bold mb-4 text-[#1a1a1a] uppercase">Thank You!</h3>
                <p className="text-gray-600 mb-8 text-lg">
                    Your request has been submitted successfully.<br />
                    We will show the warranty on your dashboard shortly.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link
                        to="/dashboard"
                        className="bg-[#1a1a1a] text-white px-8 py-4 rounded font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors w-full md:w-auto"
                    >
                        Go to Dashboard
                    </Link>

                    <a
                        href="/register-warranty"
                        className="bg-red-600 text-white px-8 py-4 rounded font-bold uppercase tracking-wider hover:bg-red-700 transition-colors w-full md:w-auto"
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.href = '/register-warranty';
                        }}
                    >
                        Register New Warranty
                    </a>
                </div>
            </div>
        );
    }

    // If product verified, show registration form
    if (productData) {
        // Check if user is logged in (customerId passed via loader/actionData?)
        // Wait, customerId comes from loader data, but WarrantyForm receives `actionData` and `productData` props.
        // I need to pass `customerId` to WarrantyForm or use useLoaderData inside it.
        // Let's rely on props. I need to update the parent usage too.
        // Actually, WarrantyForm is used in register-warranty.jsx like: <WarrantyForm actionData={actionData} productData={verifiedProduct} />
        // I should update register-warranty.jsx to pass customerId as well.

        // But for now, let's assume we can access it via useLoaderData since it's a child of the route.
        // Better: Update Component usage in parent.

        return (
            <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-red-600 w-full max-w-2xl">
                <h3 className="text-2xl font-bold mb-4 text-[#1a1a1a]">Product Verified</h3>
                <div className="flex gap-4 items-center mb-6">
                    <img src={productData.image} alt={productData.productTitle} className="w-24 h-24 object-contain" />
                    <div>
                        <p className="font-bold text-lg">{productData.productTitle}</p>
                        <p className="text-sm text-gray-600">Order: {productData.orderName}</p>
                        <p className="text-sm text-gray-600">SKU: {productData.sku}</p>
                    </div>
                </div>

                <Form method="post" className="space-y-4">
                    <input type="hidden" name="actionType" value="register" />
                    <input type="hidden" name="serial" value={serial} />
                    <input type="hidden" name="productTitle" value={productData.productTitle} />
                    <input type="hidden" name="productImage" value={productData.image} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">First Name *</label>
                            <input type="text" name="firstName" required className="w-full border p-2 rounded" placeholder="Enter your first name" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Last Name</label>
                            <input type="text" name="lastName" className="w-full border p-2 rounded" placeholder="Enter your last name" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Email *</label>
                        <input type="email" name="email" required className="w-full border p-2 rounded" placeholder="Enter your email" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Phone Number *</label>
                        <input type="tel" name="phone" required className="w-full border p-2 rounded" placeholder="+91" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Address</label>
                        <input type="text" name="address" className="w-full border p-2 rounded" placeholder="Enter your address" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">City</label>
                            <input type="text" name="city" className="w-full border p-2 rounded" placeholder="PATNA" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">State</label>
                            <input type="text" name="state" className="w-full border p-2 rounded" placeholder="BIHAR" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Zip/Postal Code</label>
                            <input type="text" name="zip" className="w-full border p-2 rounded" placeholder="800001" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Country</label>
                            <input type="text" name="country" className="w-full border p-2 rounded" placeholder="India" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Purchase Date *</label>
                        <input type="date" name="purchaseDate" required className="w-full border p-2 rounded" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Serial Number</label>
                        <input type="text" value={serial} disabled className="w-full border p-2 rounded bg-gray-100" />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-red-600 text-white py-4 font-black uppercase tracking-wider hover:bg-[#1a1a1a] transition-colors mt-6"
                        disabled={isRegistering}
                    >
                        {isRegistering ? 'Registering...' : 'Submit Registration'}
                    </button>

                    {actionData?.error && (
                        <p className="text-red-600 text-center mt-2">{actionData.error}</p>
                    )}
                </Form>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-red-600 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 uppercase text-[#1a1a1a] text-center">Enter Serial Number</h2>
            <Form method="post" className="space-y-4">
                <input type="hidden" name="actionType" value="verify" />
                <input
                    name="serial"
                    placeholder="ENTER SERIAL (E.G., 12345)"
                    className="border-2 border-gray-200 p-4 rounded w-full text-center text-lg font-mono uppercase tracking-widest focus:border-red-600 outline-none"
                    value={serial}
                    onInput={(e) => {
                        const val = e.target.value.toUpperCase();
                        e.target.value = val;
                        setSerial(val);
                    }}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-red-600 text-white py-4 font-black uppercase tracking-wider hover:bg-[#1a1a1a] transition-colors"
                    disabled={isVerifying}
                >
                    {isVerifying ? 'Verifying...' : 'Verify Product'}
                </button>
            </Form>
            {actionData?.error && (
                <p className="text-red-600 text-center mt-4 font-bold uppercase tracking-wide">{actionData.error}</p>
            )}
        </div>
    );
}
