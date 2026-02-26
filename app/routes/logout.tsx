import { redirect } from 'react-router';

/**
 * Logout Route Action
 * Clears the Shopify Customer Account session and redirects to home.
 */
export async function action({ context }) {
    const { session } = context;
    session.unset('customerAccessToken');

    return redirect('/login', {
        headers: {
            'Set-Cookie': await session.commit(),
        },
    });
}

/**
 * Logout Route Loader
 * Prevents direct access and ensures logout only happens via POST.
 */
export async function loader() {
    return null;
}
