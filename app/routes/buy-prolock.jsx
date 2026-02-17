import { useState } from 'react';
import { useLoaderData, useActionData, Form, useNavigation, redirect } from 'react-router';
import { Money } from '@shopify/hydrogen';
import { addToCart } from '~/lib/cart.server';

const PRODUCT_HANDLE = 'carkey'; // Make sure this matches Shopify product handle

const PRODUCT_QUERY = `#graphql
  query ProductDetails($handle: String!) {
    product(handle: $handle) {
      id
      title
      descriptionHtml
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

  if (result?.errors?.length) {
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

  const variant = product.variants.nodes[0];
  const isAvailable = variant?.availableForSale;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-10 bg-white shadow-xl rounded-xl mt-10 mb-10">

      {/* LEFT IMAGE */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 rounded-xl p-8">
        {product.images.nodes[0] && (
          <img
            src={product.images.nodes[0].url}
            alt={product.images.nodes[0].altText || product.title}
            className="max-w-md object-contain"
          />
        )}
      </div>

      {/* RIGHT CONTENT */}
      <div className="w-full md:w-1/2 flex flex-col">
        <h1 className="text-4xl font-black uppercase mb-6 border-b pb-4">
          {product.title}
        </h1>

        <div className="text-2xl font-bold text-red-600 mb-6">
          <Money data={variant.price} />
        </div>

        {/* Quantity */}
        <div className="mb-6 flex items-center gap-6">
          <span className="font-semibold">Quantity:</span>
          <div className="flex border rounded">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 bg-gray-100"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="px-6 py-2">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2 bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        {actionData?.error && (
          <div className="text-red-600 mb-4">{actionData.error}</div>
        )}

        <Form method="post">
          <input type="hidden" name="variantId" value={variant.id} />
          <input type="hidden" name="quantity" value={quantity} />

          <button
            type="submit"
            disabled={!isAvailable || isSubmitting}
            className={`w-full bg-red-600 text-white font-bold py-4 rounded-lg text-lg transition ${!isAvailable || isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-red-700'
              }`}
          >
            {isSubmitting
              ? 'Adding...'
              : isAvailable
                ? 'Add to Cart'
                : 'Out of Stock'}
          </button>
        </Form>
      </div>
    </div>
  );
}
