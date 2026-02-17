import { Link, useLoaderData, useFetcher } from 'react-router';
import { Money, Image } from '@shopify/hydrogen';
import { getCart, updateCartLines, removeCartLines } from '../lib/cart.server';

export async function loader({ context }) {
    const cart = await getCart(context.request, context);
    return { cart };
}

export async function action({ request, context }) {
    const formData = await request.formData();
    const { action, lineId, quantity } = Object.fromEntries(formData);

    if (action === 'update_line') {
        await updateCartLines(request, context, [
            {
                id: lineId,
                quantity: parseInt(quantity, 10),
            },
        ]);
    } else if (action === 'remove_line') {
        await removeCartLines(request, context, [lineId]);
    }

    return null;
}

const CUSTOM_PRICES = {
    'carkey': '79.99',
    'prolock-guardian': '69.99',
};

function getLinePrice(line) {
    const handle = line.merchandise.product.handle;
    if (CUSTOM_PRICES[handle]) {
        return {
            amount: CUSTOM_PRICES[handle],
            currencyCode: line.merchandise.price.currencyCode,
        };
    }
    return line.merchandise.price;
}

export default function CartPage() {
    const { cart } = useLoaderData();

    if (!cart || cart.lines.edges.length === 0) {
        return (
            <div className="w-[80%] mx-auto py-20 text-center">
                <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
                <p className="text-lg text-gray-600 mb-8">Your cart is empty.</p>
                <Link to="/comparison-table" className="inline-block bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    const lines = cart.lines.edges.map(edge => edge.node);

    // Calculate Custom Subtotal
    const customSubtotalAmount = lines.reduce((total, line) => {
        const price = getLinePrice(line);
        return total + (parseFloat(price.amount) * line.quantity);
    }, 0).toFixed(2);

    const customSubtotal = {
        amount: customSubtotalAmount,
        currencyCode: cart.cost.subtotalAmount.currencyCode,
    };

    return (
        <div className="w-[80%] mx-auto py-20">
            <h1 className="text-4xl font-bold mb-12">Your Cart</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items */}
                <div className="flex-grow space-y-6">
                    <ul className="space-y-6">
                        {lines.map((line) => (
                            <CartLineItem key={line.id} line={line} />
                        ))}
                    </ul>
                </div>

                {/* Order Summary */}
                <div className="lg:w-96 shrink-0">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Order Summary</h2>

                        <div className="flow-root">
                            <dl className="-my-4 text-sm divide-y divide-gray-200">
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-gray-600">Subtotal</dt>
                                    <dd className="font-medium text-gray-900">
                                        <Money data={customSubtotal} />
                                    </dd>
                                </div>
                                <div className="py-4 flex items-center justify-between">
                                    <dt className="text-gray-600">Total</dt>
                                    <dd className="font-medium text-gray-900">
                                        <Money data={customSubtotal} />
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="mt-6">
                            <a
                                href={cart.checkoutUrl}
                                className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-lg shadow-md text-lg font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Checkout
                            </a>
                        </div>
                        <div className="mt-4 text-center">
                            <Link to="/comparison-table" className="text-gray-600 hover:text-black font-medium underline">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


function CartLineItem({ line }) {
    const fetcher = useFetcher();

    // Optimistic UI logic
    const isRemoving =
        fetcher.state !== 'idle' &&
        fetcher.formData?.get('action') === 'remove_line' &&
        fetcher.formData?.get('lineId') === line.id;

    const isUpdating =
        fetcher.state !== 'idle' &&
        fetcher.formData?.get('action') === 'update_line' &&
        fetcher.formData?.get('lineId') === line.id;

    const pessimisticQuantity = line.quantity;
    const optimisticQuantity = isUpdating
        ? parseInt(fetcher.formData?.get('quantity'), 10)
        : pessimisticQuantity;

    if (isRemoving) return null;

    return (
        <li key={line.id} className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
            <div className="h-100 w-100 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {line.merchandise.image && (
                    <Image
                        data={line.merchandise.image}
                        sizes="(min-width: 45em) 400px, 100vw"
                        className="h-full w-full object-contain object-center p-2"
                    />
                )}
            </div>

            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold text-gray-900 hover:text-red-600 transition-colors">
                            <Link to={`/products/${line.merchandise.product.handle}`}>
                                {line.merchandise.product.title}
                            </Link>
                        </h3>
                        <div className="text-xl font-bold text-gray-900">
                            <Money data={getLinePrice(line)} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                        <fetcher.Form method="post">
                            <input type="hidden" name="action" value="update_line" />
                            <input type="hidden" name="lineId" value={line.id} />
                            <input type="hidden" name="quantity" value={optimisticQuantity - 1} />
                            <button
                                type="submit"
                                aria-label="Decrease quantity"
                                disabled={optimisticQuantity <= 1}
                                className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 hover:text-red-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                onClick={(e) => {
                                    if (optimisticQuantity <= 1) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                -
                            </button>
                        </fetcher.Form>
                        <span className="w-10 text-center font-bold text-gray-900">{optimisticQuantity}</span>
                        <fetcher.Form method="post">
                            <input type="hidden" name="action" value="update_line" />
                            <input type="hidden" name="lineId" value={line.id} />
                            <input type="hidden" name="quantity" value={optimisticQuantity + 1} />
                            <button
                                type="submit"
                                aria-label="Increase quantity"
                                className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-all"
                            >
                                +
                            </button>
                        </fetcher.Form>
                    </div>

                    <fetcher.Form method="post">
                        <input type="hidden" name="action" value="remove_line" />
                        <input type="hidden" name="lineId" value={line.id} />
                        <button type="submit" className="text-sm font-medium text-gray-500 hover:text-red-600 underline transition-colors">
                            Remove
                        </button>
                    </fetcher.Form>
                </div>
            </div>
        </li>
    );
}
