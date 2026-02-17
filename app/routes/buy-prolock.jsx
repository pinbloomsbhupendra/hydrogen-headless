import { useState } from 'react';
import { useLoaderData, useActionData, Form, redirect, useNavigation } from 'react-router';
import { Money } from '@shopify/hydrogen';
import { addToCart } from '../lib/cart.server';

const PRODUCT_HANDLE = 'carkey'; // Validated from previous file
const TARGET_VARIANT_ID = 'gid://shopify/ProductVariant/44021518073939';

const PRODUCT_QUERY = `#graphql
  query ProductDetailsProlock($handle: String!) {
    product(handle: $handle) {
      id
      title
      descriptionHtml
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }
      variants(first: 10) {
        nodes {
          id
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

export async function loader({ context }) {
    const { storefront } = context;
    const { product } = await storefront.query(PRODUCT_QUERY, {
        variables: { handle: PRODUCT_HANDLE },
    });

    if (!product) {
        throw new Response('Product not found', { status: 404 });
    }

    return { product };
}

export async function action({ request, context }) {
    const formData = await request.formData();
    const quantity = parseInt(formData.get('quantity'), 10) || 1;
    const variantId = formData.get('variantId');

    if (!variantId) {
        return { error: 'Invalid product variant.' };
    }

    const result = await addToCart(request, context, [
        { merchandiseId: variantId, quantity },
    ]);

    if (result.errors?.length) {
        return { error: result.errors[0].message };
    }

    const headers = new Headers();
    headers.append('Set-Cookie', await context.session.commit());

    return redirect('/cart', { headers });
}

export default function BuyProLock() {
    const { product } = useLoaderData();
    const actionData = useActionData();
    const navigation = useNavigation();
    const [quantity, setQuantity] = useState(1);

    const isSubmitting = navigation.state === 'submitting';

    // Default to target variant or fallback to 1st variant
    const targetVariant = product.variants.nodes.find(v => v.id === TARGET_VARIANT_ID) || product.variants.nodes[0];
    const price = targetVariant?.price;
    const isAvailable = targetVariant?.availableForSale;

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 bg-white shadow-lg rounded-lg mt-10 mb-10">
            {/* Left Column: Image */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                <img src="/img1.png" alt="Prolock" className="w-full max-w-md object-contain" />
            </div>

            {/* Right Column: Details & Actions */}
            <div className="w-full md:w-1/2 flex flex-col p-4 md:p-8">
                <h2 className="text-4xl font-black uppercase mb-8 tracking-wider text-gray-900 border-b pb-4">
                    PROLOCK
                </h2>

                <ul className="w-full list-none p-0 m-0 flex flex-col gap-6 mb-8">
                    <li className="flex items-center pb-4 border-b border-gray-200">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm mr-4">1</div>
                        <span className="text-2xl font-semibold text-gray-800">
                            $79.99
                        </span>
                    </li>
                    <li className="flex items-center pb-4 border-b border-gray-200">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm mr-4">2</div>
                        <span className="text-lg font-medium text-gray-700">Fits in Vehicle Glove Box</span>
                    </li>
                    <li className="flex items-center">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm mr-4">3</div>
                        <span className="text-lg font-medium text-gray-700">Up to $2000 Guaranteed Rebate</span>
                    </li>
                </ul>

                <div className="mt-auto">
                    {/* Quantity Selector */}
                    <div className="mb-8 flex items-center gap-6">
                        <span className="text-gray-700 font-bold text-lg">Quantity:</span>
                        <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <span className="px-4 py-1 font-semibold">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.min(6, quantity + 1))}
                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                                disabled={quantity >= 6}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {actionData?.error && (
                        <div className="text-red-600 font-medium mb-4">{actionData.error}</div>
                    )}

                    <Form method="post" className="w-full">
                        <input type="hidden" name="variantId" value={targetVariant?.id} />
                        <input type="hidden" name="quantity" value={quantity} />

                        <button
                            type="submit"
                            disabled={!isAvailable || isSubmitting}
                            className={`w-full bg-red-600 text-white font-bold italic px-12 py-4 text-xl rounded shadow transition-colors uppercase whitespace-nowrap ${!isAvailable || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                                }`}
                            data-discover="true"
                        >
                            {isSubmitting ? 'Adding...' : (isAvailable ? 'Add to Cart' : 'Out of Stock')}
                        </button>
                    </Form>
                </div>
            </div>
        </div>
    );
}
