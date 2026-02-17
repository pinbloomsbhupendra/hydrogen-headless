import { redirect } from 'react-router';

/**
 * Auth Callback Route
 * Redirects to the account authorize route.
 * This supports configurations that use /auth/callback as the redirect URI.
 */
export async function loader({ request }) {
    const url = new URL(request.url);
    return redirect(`/account/authorize${url.search}`);
}
