import { CART_QUERY, CART_CREATE, CART_LINES_ADD, CART_LINES_UPDATE, CART_LINES_REMOVE } from '../graphql/cart/cart-queries';

/**
 * @param {Request} request
 * @param {Object} context
 */
export async function getCart(request, context) {
    if (!context?.session) {
        console.warn('getCart: context.session is undefined');
        return null;
    }
    const { storefront } = context;
    const cartId = await context.session.get('cartId');

    if (!cartId) {
        return null;
    }

    try {
        const { cart } = await storefront.query(CART_QUERY, {
            variables: { cartId },
            cache: storefront.CacheNone(),
        });

        return cart;
    } catch (error) {
        console.error('Error fetching cart:', error);
        return null;
    }
}

/**
 * @param {Request} request
 * @param {Object} context
 * @param {Array} lines
 */
export async function createCart(request, context, lines) {
    const { storefront } = context;

    const { cartCreate } = await storefront.mutate(CART_CREATE, {
        variables: {
            input: {
                lines,
            },
        },
    });

    if (cartCreate?.cart?.id) {
        context.session.set('cartId', cartCreate.cart.id);
        return {
            cart: cartCreate.cart,
            errors: cartCreate.userErrors,
        };
    }

    return {
        cart: null,
        errors: cartCreate?.userErrors || [{ message: 'Failed to create cart' }],
    };
}

/**
 * @param {Request} request
 * @param {Object} context
 * @param {Array} lines
 */
export async function addToCart(request, context, lines) {
    const { storefront } = context;
    let cartId = await context.session.get('cartId');

    if (!cartId) {
        return createCart(request, context, lines);
    }

    const { cartLinesAdd } = await storefront.mutate(CART_LINES_ADD, {
        variables: {
            cartId,
            lines,
        },
    });

    if (cartLinesAdd?.cart) {
        return {
            cart: cartLinesAdd.cart,
            errors: cartLinesAdd.userErrors,
        };
    }

    // If adding to cart fails (e.g. cart expired), create a new one
    if (!cartLinesAdd?.cart && cartLinesAdd?.userErrors?.length === 0) {
        return createCart(request, context, lines);
    }

    return {
        cart: null,
        errors: cartLinesAdd?.userErrors,
    };
}

/**
 * @param {Request} request
 * @param {Object} context
 * @param {Array} lines
 */
export async function updateCartLines(request, context, lines) {
    const { storefront } = context;
    const cartId = await context.session.get('cartId');

    if (!cartId) {
        return { cart: null, errors: [{ message: 'Cart not found' }] };
    }

    const { cartLinesUpdate } = await storefront.mutate(CART_LINES_UPDATE, {
        variables: {
            cartId,
            lines,
        },
    });

    return {
        cart: cartLinesUpdate?.cart,
        errors: cartLinesUpdate?.userErrors,
    };
}

/**
 * @param {Request} request
 * @param {Object} context
 * @param {Array} lineIds
 */
export async function removeCartLines(request, context, lineIds) {
    const { storefront } = context;
    const cartId = await context.session.get('cartId');

    if (!cartId) {
        return { cart: null, errors: [{ message: 'Cart not found' }] };
    }

    const { cartLinesRemove } = await storefront.mutate(CART_LINES_REMOVE, {
        variables: {
            cartId,
            lineIds,
        },
    });

    return {
        cart: cartLinesRemove?.cart,
        errors: cartLinesRemove?.userErrors,
    };
}
