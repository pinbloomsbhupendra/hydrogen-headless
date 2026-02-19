// Virtual entry point for the app
import * as remixBuild from 'virtual:react-router/server-build';
import { createRequestHandler } from '@shopify/hydrogen';
import { createAppLoadContext } from '~/lib/context';

export default {
    async fetch(request, env, executionContext) {
        try {
            const url = new URL(request.url);
            const mode = env.NODE_ENV || 'development';
            const isProduction = mode === 'production';

            if (!env?.SESSION_SECRET && isProduction) {
                throw new Error('SESSION_SECRET environment variable is not set');
            }

            // Disable protocol forcing and host mapping for local development to ensure cookies work over http
            let currentRequest = request;
            /* 
            if (isProduction && request.headers.has('Host')) {
                const proxyUrl = new URL(request.url);
                proxyUrl.host = request.headers.get('Host');
                proxyUrl.protocol = 'https:';
                currentRequest = new Request(proxyUrl.toString(), request);
            }
            */

            const handleRequest = createRequestHandler({
                build: remixBuild,
                mode,
                getLoadContext: () =>
                    createAppLoadContext(currentRequest, env, executionContext),
            });

            const response = await handleRequest(currentRequest);

            return response;
        } catch (error) {
            console.error('[Server Error]', error);
            return new Response(error.message, { status: 500 });
        }
    },
};
