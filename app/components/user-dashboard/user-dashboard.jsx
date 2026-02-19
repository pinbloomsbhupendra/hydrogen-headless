import { Form } from 'react-router';

export const UserDashboard = ({ customer, warranty, warranties }) => {
    // Normalize to list
    const list = warranties && warranties.length > 0 ? warranties : (warranty ? [warranty] : []);

    if (list.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                    <h1 className="text-2xl font-black uppercase mb-2">Welcome, {customer?.firstName || 'Customer'}!</h1>
                    <p className="text-gray-500 text-sm mb-6">{customer?.email}</p>
                    <div className="w-full h-px bg-gray-100 mb-6" />
                    <h2 className="text-lg font-bold uppercase mb-3">No Active Warranties</h2>
                    <p className="text-gray-600 mb-6">
                        We couldn't find a warranty linked to your account. Register your ProLock to activate your coverage.
                    </p>
                    <a href="/register-warranty?new=true" className="inline-block bg-red-600 text-white px-6 py-3 rounded font-bold uppercase hover:bg-black transition-colors w-full mb-4">
                        Register a Product
                    </a>
                    <Form action="/logout" method="POST">
                        <button type="submit" className="text-sm text-gray-400 hover:text-red-600 transition-colors font-bold uppercase tracking-widest">
                            Sign Out
                        </button>
                    </Form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-8 border-b-4 border-red-600 pb-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase italic text-[#1a1a1a]">
                            My Dashboard
                        </h1>
                        <p className="text-sm font-bold text-gray-500 uppercase mt-1">Welcome back, <span className="text-red-600">{customer.firstName} {customer.lastName}</span></p>
                    </div>
                    <div className="text-right">
                        <Form action="/logout" method="POST">
                            <button
                                type="submit"
                                className="text-sm text-gray-400 hover:text-red-600 transition-colors font-bold uppercase tracking-widest"
                            >
                                Sign Out →
                            </button>
                        </Form>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <a
                        href="/register-warranty?new=true"
                        className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded font-bold uppercase text-sm hover:bg-black transition-colors tracking-wide"
                    >
                        <span>＋</span> Register Another Product
                    </a>
                    <a
                        href="/comparison-table"
                        className="inline-flex items-center gap-2 border-2 border-gray-800 text-gray-800 px-5 py-2 rounded font-bold uppercase text-sm hover:bg-gray-800 hover:text-white transition-colors tracking-wide"
                    >
                        🛒 Buy Product
                    </a>
                </div>

                {/* Warranties List */}
                <div className="grid gap-8">
                    {list.map((item, index) => (
                        <div key={item.id || index} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                            {/* LEFT SIDE - PRODUCT IMAGE */}
                            <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-8 md:p-12 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Status Badge */}
                                <div className="absolute top-6 left-6 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg z-10">
                                    Active Warranty
                                </div>

                                {item.productImage ? (
                                    <img
                                        src={item.productImage}
                                        alt={item.productName}
                                        className="w-full h-auto max-h-[400px] object-contain drop-shadow-2xl transform transition-transform group-hover:scale-105 duration-500"
                                    />
                                ) : (
                                    <div className="text-center p-10 border-4 border-dashed border-gray-300 rounded-xl">
                                        <p className="text-gray-400 font-bold text-xl uppercase">No Product Image</p>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT SIDE - DETAILS */}
                            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                <div className="mb-8">
                                    <h2 className="text-sm font-black text-red-600 uppercase tracking-widest mb-2">Product Details</h2>
                                    <h3 className="text-4xl font-black italic text-[#1a1a1a] leading-none mb-1">{item.productName || 'Unknown Product'}</h3>
                                    {item.modelType && <p className="text-gray-500 font-bold uppercase text-sm mb-6">{item.modelType} Edition</p>}

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 text-sm">
                                        <div>
                                            <p className="text-gray-400 font-bold uppercase text-xs mb-1">Serial Number</p>
                                            <p className="font-mono font-bold text-lg text-gray-800">{item.serial}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-bold uppercase text-xs mb-1">Warranty Number</p>
                                            <p className="font-mono font-bold text-lg text-gray-800">{item.warrantyNumber || 'PENDING'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-bold uppercase text-xs mb-1">Order ID</p>
                                            <p className="font-mono font-medium text-gray-700">{item.orderId || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 font-bold uppercase text-xs mb-1">Purchase Date</p>
                                            <p className="font-medium text-gray-700">
                                                {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8 p-6 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-green-700 font-bold uppercase mb-1">Warranty Expires On</p>
                                        <p className="text-2xl font-black text-green-800">
                                            {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'Unknown'}
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center text-green-700 text-xl">
                                        ✓
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
