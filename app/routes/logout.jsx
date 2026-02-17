import { redirect } from 'react-router';

/**
 * Logout Route Action
 * Clears the Shopify Customer Account session and redirects to home.
 */
export async function action({ context }) {
    const response = await context.customerAccount.logout();

    response.headers.append(
        'Set-Cookie',
        await context.session.commit()
    );

    return redirect('/login', {
        headers: response.headers,
    });
}

/**
 * Logout Route Loader
 * Prevents direct access and ensures logout only happens via POST.
 */
export async function loader() {
    return null;
}
