import { Form } from 'react-router';

export const UserDashboard = ({ customer, warranty, warranties }) => {
    // Normalize to list
    const list = warranties && warranties.length > 0 ? warranties : (warranty ? [warranty] : []);

    if (list.length === 0) {
        return (
            <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-112px)] bg-[#b3b3b3] flex flex-col items-center justify-center p-4">
                <div className="form-card max-w-md text-center w-full">
                    <h1 className="text-2xl font-black uppercase mb-2">Welcome, {customer?.firstName || 'Customer'}!</h1>
                    <p className="text-gray-500 text-sm mb-6">{customer?.email}</p>
                    <div className="w-full h-px bg-gray-100 mb-6" />
                    <h2 className="text-lg font-bold uppercase mb-3">No Active Warranties</h2>
                    <p className="text-gray-600 mb-6">
                        We couldn't find a warranty linked to your account. Register your ProLock to activate your coverage.
                    </p>
                    <a href="/register-warranty?new=true" className="btn-form-submit mb-4 block">
                        Register a Product
                    </a>
                    <Form action="/logout" method="POST">
                        <button type="submit" className="btn-signout-link text-sm">
                            Sign Out
                        </button>
                    </Form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-112px)] bg-[#b3b3b3] flex flex-col items-start py-8 md:py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="italic-heading text-3xl text-prolock-black-alt">
                            My Dashboard
                        </h1>
                        <p className="text-sm font-bold text-gray-500 uppercase mt-1">Welcome back, <span className="text-prolock-red">{customer.firstName} {customer.lastName}</span></p>
                    </div>
                    <div className="text-right">
                        <Form action="/logout" method="POST">
                            <button
                                type="submit"
                                className="btn-signout-link text-sm"
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
                        className="inline-flex items-center gap-2 bg-prolock-red text-white px-5 py-2 rounded font-bold uppercase text-sm hover:bg-black transition-colors tracking-wide"
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
                        <div key={item.id || index} className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-row">
                            {/* LEFT SIDE - PRODUCT IMAGE */}
                            <div className="w-2/5 md:w-1/2 bg-gray-100 flex items-center justify-center p-3 sm:p-8 md:p-12 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Status Badge */}
                                <div className="absolute top-2 left-2 md:top-6 md:left-6 badge-active z-10 scale-75 md:scale-100 origin-top-left">
                                    Active Warranty
                                </div>

                                {item.productImage ? (
                                    <img
                                        src={item.productImage}
                                        alt={item.productName}
                                        className="w-full h-auto max-h-[160px] md:max-h-[400px] object-contain drop-shadow-xl md:drop-shadow-2xl transform transition-transform group-hover:scale-105 duration-500"
                                    />
                                ) : (
                                    <div className="text-center p-10 border-4 border-dashed border-gray-300 rounded-xl">
                                        <p className="text-gray-400 font-bold text-xl uppercase">No Product Image</p>
                                    </div>
                                )}
                            </div>

                            {/* RIGHT SIDE - DETAILS */}
                            <div className="w-3/5 md:w-1/2 p-4 sm:p-8 md:p-12 flex flex-col justify-center">
                                <div className="mb-4 md:mb-8">
                                    <h2 className="text-[10px] md:text-sm font-black text-prolock-red uppercase tracking-widest mb-1 md:mb-2">Product Details</h2>
                                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-black italic text-prolock-black leading-none mb-1">{item.productName || 'Unknown Product'}</h3>
                                    {item.modelType && <p className="text-gray-500 font-bold uppercase text-[10px] md:text-sm mb-4 md:mb-6">{item.modelType} Edition</p>}

                                    <div className="grid grid-cols-2 gap-x-2 md:gap-x-4 gap-y-3 md:gap-y-6 text-[10px] md:text-sm">
                                        <div>
                                            <p className="detail-label text-[9px] md:text-xs">Serial Number</p>
                                            <p className="detail-value text-xs md:text-lg">{item.serial}</p>
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="detail-label text-[9px] md:text-xs">Warranty Number</p>
                                            <p className="detail-value text-[11px] md:text-lg truncate">{item.warrantyNumber || 'PENDING'}</p>
                                        </div>
                                        <div>
                                            <p className="detail-label text-[9px] md:text-xs">Order ID</p>
                                            <p className="detail-value text-[11px] md:text-base">{item.orderId || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="detail-label text-[9px] md:text-xs">Purchase Date</p>
                                            <p className="detail-value text-[11px] md:text-base font-sans">
                                                {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4 md:mb-8 p-3 md:p-6 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] md:text-xs text-green-700 font-bold uppercase mb-0.5 md:mb-1">Warranty Expires</p>
                                        <p className="text-sm md:text-2xl font-black text-green-800">
                                            {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'Unknown'}
                                        </p>
                                    </div>
                                    <div className="h-6 w-6 md:h-12 md:w-12 bg-green-200 rounded-full flex items-center justify-center text-green-700 text-xs md:text-xl">
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
