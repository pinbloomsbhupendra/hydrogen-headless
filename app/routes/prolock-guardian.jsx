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

import { CART_CREATE, CART_LINES_ADD } from '~/graphql/cart/mutations';

export async function action({ request, context }) {
    const { storefront, session } = context;
    const formData = await request.formData();
    const variantId = formData.get('variantId');
    const quantity = parseInt(formData.get('quantity'), 10) || 1;

    console.log('[Guardian Action RAW API] Adding to cart:', { variantId, quantity });

    try {
        let cartId = await session.get('cartId');
        let updatedCart = null;

        if (!cartId) {
            const { cartCreate } = await storefront.mutate(CART_CREATE, {
                variables: { input: { lines: [{ merchandiseId: variantId, quantity }] } }
            });
            updatedCart = cartCreate?.cart;
            cartId = updatedCart?.id;
        } else {
            const { cartLinesAdd } = await storefront.mutate(CART_LINES_ADD, {
                variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] }
            });
            updatedCart = cartLinesAdd?.cart;

            if (!updatedCart && cartLinesAdd?.userErrors?.length === 0) {
                const { cartCreate } = await storefront.mutate(CART_CREATE, {
                    variables: { input: { lines: [{ merchandiseId: variantId, quantity }] } }
                });
                updatedCart = cartCreate?.cart;
                cartId = updatedCart?.id;
            }
        }

        if (!updatedCart) throw new Error("Failed to modify cart via API");

        console.log('[Guardian RAW API] Cart result updated. Total quantity:', updatedCart.totalQuantity);

        session.set('cartId', cartId);

        return data({ success: true, cart: updatedCart }, {
            headers: { 'Set-Cookie': await session.commit() }
        });
    } catch (error) {
        console.error('[Guardian RAW API] Error adding to cart:', error);
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
        <div className="w-full max-w-5xl mx-auto px-4 py-8 lg:py-14 lg:px-8 flex flex-col lg:flex-row gap-8 lg:gap-14 bg-white">
            {/* Left Column: Image */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-prolock-gray-bg rounded-sm p-6 sm:p-8">
                <img
                    src="/Product/img2.png"
                    alt="Prolock Guardian"
                    className="w-full max-w-[340px] lg:max-w-full max-h-[380px] object-contain mx-auto"
                />
            </div>

            {/* Right Column: Details & Actions */}
            <div className="w-full lg:w-1/2 flex flex-col">
                <h1 className="product-title italic-heavy">
                    PROLOCK GUARDIAN
                </h1>
                <div className="w-full h-[1px] bg-gray-300 mb-6 md:mb-8"></div>

                <ul className="w-full list-none p-0 m-0 flex flex-col gap-4 mb-0">
                    <li className="flex items-center pb-2 border-b border-gray-100">
                        <div className="product-bullet-number">1</div>
                        <span className="text-xl font-bold text-prolock-black tracking-tight">
                            ${firstVariant.price.amount}
                        </span>
                    </li>
                    <li className="flex items-center pb-2 border-b border-gray-100">
                        <div className="product-bullet-number">2</div>
                        <span className="text-base font-medium text-gray-600">Larger Size Stored on Floor or Boot</span>
                    </li>
                    <li className="flex items-center">
                        <div className="product-bullet-number">3</div>
                        <span className="text-base font-medium text-gray-600">Up to $1500 Guaranteed Rebate</span>
                    </li>
                </ul>

                <div className="flex flex-col gap-6 md:gap-8 mt-6">
                    <div className="flex items-center gap-4">
                        <span className="text-prolock-navy font-bold text-lg">Quantity:</span>
                        <div className="flex items-center border border-gray-200 rounded">
                            <button
                                type="button"
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                className="px-3 py-1 text-gray-400 hover:text-gray-600 border-r border-gray-200"
                            >
                                -
                            </button>
                            <span className="px-6 py-1 font-bold text-prolock-black min-w-[40px] text-center">{quantity}</span>
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
                            className="btn-add-to-cart"
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
            <h1 className="text-2xl font-bold text-prolock-red mb-4">Error Loading Page</h1>
            <p className="text-gray-600 mb-6">
                {error?.message || 'There was an issue loading the product details.'}
            </p>
        </div>
    );
}
