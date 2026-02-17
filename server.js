import * as remixBuild from 'virtual:react-router/server-build';
import { createRequestHandler } from '@shopify/hydrogen';
import { createAppLoadContext } from '~/lib/context';

export default {
    async fetch(request, env, executionContext) {
        try {
            if (!env?.SESSION_SECRET) {
                throw new Error('SESSION_SECRET environment variable is not set');
            }

            // Force the request URL to use the custom domain if present in environment or hardcoded
            let requestUrl = new URL(request.url);
            if (requestUrl.hostname.includes('myshopify.dev') || requestUrl.hostname.includes('oxygen')) {
                // If running on Oxygen but want to enforce the custom domain
                requestUrl.hostname = 'myhydrogen.pinblooms.in';
                requestUrl.protocol = 'https:';
                requestUrl.port = ''; // Standard HTTPS port
            }

            const handleRequest = createRequestHandler({
                build: remixBuild,
                mode: env.NODE_ENV || 'production',
                getLoadContext: () =>
                    createAppLoadContext(new Request(requestUrl.toString(), request), env, executionContext),
            });

            const response = await handleRequest(new Request(requestUrl.toString(), request));

            return response;
        } catch (error) {
            console.error(error);
            return new Response('An unexpected error occurred', { status: 500 });
        }
    },
};
