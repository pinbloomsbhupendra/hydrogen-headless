/**
 * Server Entry Point
 * 
 * Handles server-side rendering (SSR) of the React application.
 * Renders the application to a stream for optimal performance and
 * handles bot detection for SEO optimization.
 * 
 * @module entry.server
 */

import { renderToReadableStream } from 'react-dom/server';
import { ServerRouter } from 'react-router';
import { isbot } from 'isbot';

/**
 * Handle Request Function
 * 
 * Main server-side rendering handler.
 * Renders the React application to a readable stream and handles:
 * - Bot detection (waits for full render for crawlers)
 * - Error handling during rendering
 * - Response headers configuration
 * 
 * @async
 * @param {Request} request - The incoming HTTP request
 * @param {number} responseStatusCode - Initial HTTP status code
 * @param {Headers} responseHeaders - HTTP response headers
 * @param {Object} routerContext - React Router context for SSR
 * @returns {Promise<Response>} HTTP response with rendered HTML
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  routerContext,
) {
  // Render the application to a readable stream
  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    }
  );

  // Wait for full render if the request is from a bot (for SEO)
  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  responseHeaders.set('Content-Type', 'text/html; charset=utf-8');

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
