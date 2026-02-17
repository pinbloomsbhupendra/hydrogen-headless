/**
 * @param {Route.ActionArgs}
 */
export async function action({ params, context, request }) {
  try {
    const response = await fetch(
      `https://${context.env.PUBLIC_CHECKOUT_DOMAIN}/api/${params.version}/graphql.json`,
      {
        method: 'POST',
        body: request.body,
        headers: request.headers,
      },
    );

    return new Response(response.body, { headers: new Headers(response.headers) });
  } catch (error) {
    console.error('API Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/** @typedef {import('./+types/api.$version.[graphql.json]').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
