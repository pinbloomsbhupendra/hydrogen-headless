import { redirect } from 'react-router';

/**
 * Account Authorize Route
 * Handles the OAuth callback from Shopify Customer Account API.
 */
export async function loader({ context }) {
    try {
        const response = await context.customerAccount.authorize();

        // CRITICAL: Commit the session to save the auth token
        response.headers.append('Set-Cookie', await context.session.commit());

        return response;
    } catch (error) {
        console.error('Authorize callback error:', error);
        return redirect('/account');
    }
}
