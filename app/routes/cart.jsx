import { useLoaderData, Link, Form, data, useFetcher } from 'react-router';
import { CART_QUERY } from '~/graphql/cart/queries';

export async function loader({ context }) {
    const { storefront, session } = context;
    const cartId = session.get('cartId');
    const customerAccessToken = await session.get('customerAccessToken');

    let cartData = null;
    if (cartId) {
        const result = await storefront.query(CART_QUERY, {
            variables: { cartId },
            cache: storefront.CacheNone(),
        });
        cartData = result.cart;
    }

    const isLoggedIn = !!customerAccessToken;
    return data({ cart: cartData, isLoggedIn }, {
        headers: {
            'Set-Cookie': await session.commit(),
        }
    });
}

export async function action({ request, context }) {
    const { cart, session } = context;
    const formData = await request.formData();
    const action = formData.get('action');

    if (action === 'remove') {
        const lineId = formData.get('lineId');
        await cart.removeLines([lineId]);
    }

    if (action === 'update') {
        const lineId = formData.get('lineId');
        const quantity = parseInt(formData.get('quantity'), 10);
        await cart.updateLines([{ id: lineId, quantity }]);
    }

    return new Response(null, {
        headers: {
            'Set-Cookie': await session.commit(),
        },
    });
}

export default function Cart() {
    const { cart, isLoggedIn } = useLoaderData();
    const fetcher = useFetcher();

    const lines = cart?.lines?.nodes || [];
    let checkoutUrl = cart?.checkoutUrl;

    if (isLoggedIn && checkoutUrl) {
        checkoutUrl = `${checkoutUrl}?logged_in=true`;
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-12 min-h-screen bg-white">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

            {lines.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xl text-gray-500 mb-6">Your cart is currently empty.</p>
                    <Link to="/buy-prolock" className="inline-block bg-red-600 text-white font-bold py-3 px-8 rounded hover:bg-red-700 transition-colors">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Cart Items Column */}
                    <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                        {lines.map((line) => (
                            <div key={line.id} className="p-6 border-b border-gray-100 last:border-0 flex gap-6">
                                {/* Product Image */}
                                <div className="w-40 h-40 bg-gray-50 rounded-md shrink-0 flex items-center justify-center p-2">
                                    <img
                                        src={line.merchandise.image?.url}
                                        alt={line.merchandise.product.title}
                                        className="w-full h-full object-contain mix-blend-multiply"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {line.merchandise.product.title}
                                        </h3>
                                        <p className="text-lg font-bold text-gray-900">
                                            ${parseFloat(line.cost.totalAmount.amount).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Variant Title if needed */}
                                    {line.merchandise.title !== 'Default Title' && (
                                        <p className="text-sm text-gray-500 mb-4">{line.merchandise.title}</p>
                                    )}

                                    <div className="mt-auto flex justify-between items-center">
                                        {/* Quantity Selector */}
                                        <div className="flex items-center border border-gray-200 rounded bg-white">
                                            <fetcher.Form method="POST" className="contents">
                                                <input type="hidden" name="action" value="update" />
                                                <input type="hidden" name="lineId" value={line.id} />
                                                <input type="hidden" name="quantity" value={Math.max(1, line.quantity - 1)} />
                                                <button type="submit" className="px-3 py-1 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors">-</button>
                                            </fetcher.Form>
                                            <span className="px-3 py-1 text-sm font-semibold text-gray-900 min-w-[2rem] text-center border-x border-gray-100">
                                                {line.quantity}
                                            </span>
                                            <fetcher.Form method="POST" className="contents">
                                                <input type="hidden" name="action" value="update" />
                                                <input type="hidden" name="lineId" value={line.id} />
                                                <input type="hidden" name="quantity" value={line.quantity + 1} />
                                                <button type="submit" className="px-3 py-1 text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors">+</button>
                                            </fetcher.Form>
                                        </div>

                                        {/* Remove Link */}
                                        <fetcher.Form method="POST">
                                            <input type="hidden" name="action" value="remove" />
                                            <input type="hidden" name="lineId" value={line.id} />
                                            <button type="submit" className="text-sm text-gray-500 hover:text-red-600 underline transition-colors">
                                                Remove
                                            </button>
                                        </fetcher.Form>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary Column */}
                    <div className="lg:col-span-1 bg-white rounded-lg border border-gray-100 shadow-sm p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                        <div className="w-full h-px bg-gray-200 mb-4"></div>

                        <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-600 text-sm">Subtotal</span>
                            <span className="font-bold text-gray-900 text-sm">
                                ${parseFloat(cart.cost.subtotalAmount.amount).toFixed(2)}
                            </span>
                        </div>

                        <div className="w-full h-px bg-gray-100 mb-4"></div>

                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-900 font-bold text-base">Total</span>
                            <span className="text-gray-900 font-bold text-base">
                                ${parseFloat(cart.cost.totalAmount.amount).toFixed(2)}
                            </span>
                        </div>

                        <a
                            href={isLoggedIn ? checkoutUrl : (checkoutUrl || '/account/login')}
                            className="block w-full bg-[#d6001c] hover:bg-[#b50018] text-white text-center font-bold py-3.5 rounded transition-colors shadow-sm"
                        >
                            Checkout
                        </a>

                        <Link
                            to="/buy-prolock"
                            className="block text-center text-sm text-gray-500 mt-4 hover:text-gray-800 underline decoration-gray-300 underline-offset-4 transition-colors"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
