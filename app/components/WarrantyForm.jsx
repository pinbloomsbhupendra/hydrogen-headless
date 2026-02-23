import { Form, useNavigation, Link } from 'react-router';
import { useState, useEffect } from 'react';

export default function WarrantyForm({ actionData, productData, customerId, initialOrderNumber, initialEmail }) {
    const navigation = useNavigation();

    // State for verification form
    const [orderNumber, setOrderNumber] = useState(initialOrderNumber || '');
    const [email, setEmail] = useState(initialEmail || '');

    // State for registration form
    const [serial, setSerial] = useState('');
    const [selectedProductIndex, setSelectedProductIndex] = useState(0); // Default to first product

    const isVerifying = navigation.state === 'submitting' && navigation.formData?.get('actionType') === 'verify';
    const isRegistering = navigation.state === 'submitting' && navigation.formData?.get('actionType') === 'register';

    // If already registered
    if (actionData?.registered || actionData?.warranty) {
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

                    <Link
                        to="/register-warranty?new=true"
                        className="w-full bg-red-600 text-white font-bold py-4 rounded hover:bg-black transition-colors uppercase tracking-widest text-sm flex items-center justify-center"
                    >
                        Register New Warranty
                    </Link>
                </div>
            </div>
        );
    }

    // If order verified, show registration form
    if (productData) {
        const products = productData.products || [productData];
        const currentProduct = products[selectedProductIndex] || products[0];

        return (
            <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-red-600 w-full max-w-2xl">
                <h3 className="text-2xl font-bold mb-4 text-[#1a1a1a]">Order Verified</h3>

                {/* Product Selection if Multiple */}
                {products.length > 1 && (
                    <div className="mb-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <p className="font-bold text-sm uppercase text-gray-500 mb-3">Select Product to Register:</p>
                        <div className="space-y-3">
                            {products.map((prod, idx) => (
                                <label
                                    key={idx}
                                    className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${selectedProductIndex === idx ? 'border-red-600 bg-white shadow-sm' : 'border-gray-200 hover:bg-white'}`}
                                >
                                    <input
                                        type="radio"
                                        name="productSelect"
                                        checked={selectedProductIndex === idx}
                                        onChange={() => setSelectedProductIndex(idx)}
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                    />
                                    <div className="ml-3 flex items-center gap-3">
                                        {prod.image && <img src={prod.image} alt="" className="w-10 h-10 object-contain" />}
                                        <span className={`font-medium ${selectedProductIndex === idx ? 'text-black' : 'text-gray-600'}`}>{prod.title}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-4 items-center mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    {currentProduct.image && (
                        <img src={currentProduct.image} alt={currentProduct.title} className="w-24 h-24 object-contain" />
                    )}
                    <div>
                        <p className="font-bold text-lg">{currentProduct.title}</p>
                        <p className="text-sm text-gray-600">Order: {productData.orderName}</p>
                        <p className="text-sm text-gray-600">Date: {productData.purchaseDate}</p>
                    </div>
                </div>

                <Form method="post" className="space-y-4">
                    <input type="hidden" name="actionType" value="register" />

                    {/* Submit Selected Product Details */}
                    <input type="hidden" name="productTitle" value={currentProduct.title} />
                    <input type="hidden" name="productImage" value={currentProduct.image || ''} />
                    <input type="hidden" name="purchaseDate" value={productData.purchaseDate || ''} />

                    {/* Persist verified values */}
                    <input type="hidden" name="orderNumber" value={productData.orderName} />
                    <input type="hidden" name="orderId" value={productData.orderId} />
                    <input type="hidden" name="verifiedEmail" value={productData.email} />

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
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full border p-2 rounded bg-gray-50"
                            defaultValue={productData.email}
                            readOnly
                        />
                        <p className="text-xs text-gray-500 mt-1">Verified from order</p>
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
                            <input type="text" name="city" className="w-full border p-2 rounded" placeholder="city" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">State</label>
                            <input type="text" name="state" className="w-full border p-2 rounded" placeholder="state" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Zip/Postal Code</label>
                            <input type="text" name="zip" className="w-full border p-2 rounded" placeholder="postal code" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Country</label>
                            <input type="text" name="country" className="w-full border p-2 rounded" placeholder="Country" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Purchase Date</label>
                        <input
                            type="date"
                            name="purchaseDateDisplay"
                            className="w-full border p-2 rounded bg-gray-50"
                            defaultValue={productData.purchaseDate}
                            disabled
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Serial Number *</label>
                        <input
                            type="text"
                            name="serial"
                            required
                            placeholder="Enter Product Serial Number"
                            className="w-full border p-2 rounded uppercase font-mono"
                            value={serial}
                            onChange={(e) => setSerial(e.target.value.toUpperCase())}
                        />
                        <p className="text-xs text-gray-500 mt-1">Found on the product or box.</p>
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
            <h2 className="text-xl font-bold mb-4 uppercase text-[#1a1a1a] text-center">Verify Your Order</h2>
            <Form method="post" className="space-y-4">
                <input type="hidden" name="actionType" value="verify" />

                <div>
                    <label className="block text-sm font-bold mb-1 uppercase text-gray-700">Order Number</label>
                    <input
                        name="orderNumber"
                        placeholder="e.g. 1001"
                        className="border-2 border-gray-200 p-4 rounded w-full text-lg font-mono uppercase tracking-widest focus:border-red-600 outline-none"
                        value={orderNumber}
                        onInput={(e) => setOrderNumber(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-1 uppercase text-gray-700">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="ENTER EMAIL USED AT CHECKOUT"
                        className="border-2 border-gray-200 p-4 rounded w-full text-lg tracking-wide focus:border-red-600 outline-none"
                        value={email}
                        onInput={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-red-600 text-white py-4 font-black uppercase tracking-wider hover:bg-[#1a1a1a] transition-colors mt-2"
                    disabled={isVerifying}
                >
                    {isVerifying ? 'Verifying...' : 'Verify Order'}
                </button>
            </Form>
            {actionData?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mt-4 text-center">
                    <strong className="font-bold block uppercase text-xs mb-1">Error</strong>
                    <span className="block sm:inline text-sm">{actionData.error}</span>
                </div>
            )}
        </div>
    );
}
