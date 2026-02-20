import { useState } from 'react';
import { useLoaderData, useFetcher, data } from 'react-router';

import { PRODUCT_DETAILS_QUERY } from '~/graphql/product/queries';

const PRODUCT_HANDLE = 'prolock-guardian';

export async function loader({ context }) {
    const { storefront } = context;
    const { product } = await storefront.query(PRODUCT_DETAILS_QUERY, {
        variables: { handle: PRODUCT_HANDLE },
        cache: storefront.CacheNone(),
    });

    if (!product) {
        throw new Response('Product not found', { status: 404 });
    }

    return { product };
}

export async function action({ request, context }) {
    const { cart, session } = context;
    const formData = await request.formData();
    const variantId = formData.get('variantId');
    const quantity = parseInt(formData.get('quantity'), 10) || 1;

    console.log('[Guardian Action] Adding to cart:', { variantId, quantity });

    try {
        const result = await cart.addLines([{ merchandiseId: variantId, quantity }]);
        console.log('[Guardian Action] Cart result updated. Total quantity:', result?.cart?.totalQuantity);

        // Manually ensure session is updated if a new cart was created
        if (result?.cart?.id) {
            session.set('cartId', result.cart.id);
        }

        const headers = new Headers();
        headers.append('Set-Cookie', await session.commit());

        return data({ success: true, cart: result?.cart }, {
            headers
        });
    } catch (error) {
        console.error('[Guardian Action] Error adding to cart:', error);
        return data({ success: false, error: error.message }, { status: 500 });
    }
}

export default function BuyProLockGuardian() {
    const { product } = useLoaderData();
    const [quantity, setQuantity] = useState(1);
    const fetcher = useFetcher();

    const firstVariant = product.variants.nodes?.[0];
    const isAvailable = firstVariant?.availableForSale;

    if (!firstVariant) {
        return (
            <div className="w-full max-w-7xl mx-auto p-4 md:p-8 mt-10 text-center">
                <h1 className="text-2xl font-bold text-red-600">Product Unavailable</h1>
            </div>
        );
    }

    const isAdding = fetcher.state !== 'idle';

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-12 flex flex-col md:flex-row gap-12 bg-white mt-10 mb-10">
            {/* Left Column: Image */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-[#f9f9f9] rounded-sm p-4">
                <img
                    src="/img2.png"
                    alt="Prolock Guardian"
                    className="w-full object-contain"
                />
            </div>

            {/* Right Column: Details & Actions */}
            <div className="w-full md:w-1/2 flex flex-col pt-4">
                <h1 className="text-[2.5rem] font-black text-[#001f3f] tracking-tight mb-2 uppercase italic italic-heavy">
                    PROLOCK GUARDIAN
                </h1>
                <div className="w-full h-[1px] bg-gray-300 mb-8"></div>

                <ul className="w-full list-none p-0 m-0 flex flex-col gap-4 mb-0">
                    <li className="flex items-center pb-2 border-b border-gray-100">
                        <div className="shrink-0 w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs mr-4">1</div>
                        <span className="text-xl font-bold text-[#333] tracking-tight">
                            ${firstVariant.price.amount}
                        </span>
                    </li>
                    <li className="flex items-center pb-2 border-b border-gray-100">
                        <div className="shrink-0 w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs mr-4">2</div>
                        <span className="text-base font-medium text-[#4b5563]">Larger Size Stored on Floor or Boot</span>
                    </li>
                    <li className="flex items-center">
                        <div className="shrink-0 w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs mr-4">3</div>
                        <span className="text-base font-medium text-[#4b5563]">Up to $1500 Guaranteed Rebate</span>
                    </li>
                </ul>

                <div className="flex flex-col gap-8 mt-6">
                    <div className="flex items-center gap-4">
                        <span className="text-[#001f3f] font-bold text-lg">Quantity:</span>
                        <div className="flex items-center border border-gray-200 rounded">
                            <button
                                type="button"
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                className="px-3 py-1 text-gray-400 hover:text-gray-600 border-r border-gray-200"
                            >
                                -
                            </button>
                            <span className="px-6 py-1 font-bold text-[#333] min-w-[40px] text-center">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity(prev => Math.min(6, prev + 1))}
                                className="px-3 py-1 text-gray-400 hover:text-gray-600 border-l border-gray-200"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <fetcher.Form method="POST">
                        <input type="hidden" name="variantId" value={firstVariant.id} />
                        <input type="hidden" name="quantity" value={quantity} />
                        <button
                            type="submit"
                            disabled={!isAvailable || isAdding}
                            className={`w-full bg-red-600 text-white font-black italic py-4 text-lg rounded shadow-sm hover:bg-red-700 transition-colors uppercase ${!isAvailable || isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isAdding ? 'ADDING...' : 'ADD TO CART'}
                        </button>
                    </fetcher.Form>
                </div>
            </div>
        </div>
    );
}

export function ErrorBoundary({ error }) {
    return (
        <div className="p-10 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Page</h1>
            <p className="text-gray-600 mb-6">
                {error?.message || 'There was an issue loading the product details.'}
            </p>
        </div>
    );
}
