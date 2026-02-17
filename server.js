// Virtual entry point for the app
import * as remixBuild from 'virtual:react-router/server-build';
import { createRequestHandler } from '@shopify/hydrogen';
import { createAppLoadContext } from '~/lib/context';

export default {
    async fetch(request, env, executionContext) {
        try {
            if (!env?.SESSION_SECRET) {
                throw new Error('SESSION_SECRET environment variable is not set');
            }

            // Ensure the request URL matches the Host header (useful for proxies/Oxygen)
            const url = new URL(request.url);
            if (request.headers.has('Host')) {
                url.host = request.headers.get('Host');
                url.protocol = 'https:'; // Assume HTTPS behind proxy
            }

            const newRequest = new Request(url.toString(), request);

            const handleRequest = createRequestHandler({
                build: remixBuild,
                mode: env.NODE_ENV || 'production',
                getLoadContext: () =>
                    createAppLoadContext(newRequest, env, executionContext),
            });

            const response = await handleRequest(newRequest);

            return response;
        } catch (error) {
            console.error(error);
            return new Response(error.stack || error.message, { status: 500 });
        }
    },
};
