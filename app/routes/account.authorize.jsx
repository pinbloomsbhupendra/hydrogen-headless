import {redirect} from '@shopify/remix-oxygen';

export async function loader({context, request}) {
  try {
    // IMPORTANT: pass request here
    const response = await context.customerAccount.authorize(request);

    // Save session cookie
    response.headers.append(
      'Set-Cookie',
      await context.session.commit()
    );

    return response;
  } catch (error) {
    console.error('Authorize callback error:', error);
    return redirect('/account/login');
  }
}
