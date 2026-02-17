import {redirect} from '@shopify/remix-oxygen';

/**
 * Handles OAuth callback from Shopify Customer Account API
 */
export async function loader({context, request}) {
  try {
    // Complete authorization and get response
    const response = await context.customerAccount.authorize(request);

    // Commit session so customer token is stored in cookies
    response.headers.append('Set-Cookie', await context.session.commit());

    return response;
  } catch (error) {
    console.error('Authorize callback error:', error);
    return redirect('/account');
  }
}
