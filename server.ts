// Virtual entry point for the app
import * as remixBuild from 'virtual:react-router/server-build';
import { createRequestHandler } from '@shopify/hydrogen';
import { createAppLoadContext } from '~/lib/context';

export default {
    async fetch(request, env, executionContext) {
        try {
            const url = new URL(request.url);
            const isProduction = env?.NODE_ENV === 'production';
            const sessionSecret = env?.SESSION_SECRET || env?.env?.SESSION_SECRET;

            if (url.pathname === '/private_access_tokens') {
                return new Response(JSON.stringify({}), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }

            if (url.pathname === '/favicon.ico') {
                return new Response(null, {
                    status: 200,
                    headers: { 'Access-Control-Allow-Origin': '*' }
                });
            }

            if (!sessionSecret && isProduction) {
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

            // Sanitize env to prevent Hydrogen from auto-registering OIDC routes
            const {
                PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
                PUBLIC_CUSTOMER_ACCOUNT_API_URL,
                ...filteredEnv
            } = env || {};

            const mode = env?.NODE_ENV || 'development';
            const handleRequest = createRequestHandler({
                build: remixBuild,
                mode,
                getLoadContext: () =>
                    createAppLoadContext(currentRequest, filteredEnv, executionContext),
            });

            const response = await handleRequest(currentRequest);

            return response;
        } catch (error) {
            console.error('[Server Error]', error);
            return new Response(error.message, { status: 500 });
        }
    },
};
