export async function loader({context, request}) {
  try {
    // Complete OAuth authorization
    const response = await context.customerAccount.authorize(request);

    // Store session cookie
    response.headers.append(
      'Set-Cookie',
      await context.session.commit()
    );

    return response;
  } catch (error) {
    console.error('Authorize callback error:', error);

    // Fallback redirect without external imports
    return new Response(null, {
      status: 302,
      headers: { Location: '/account/login' },
    });
  }
}
