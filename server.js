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

            const handleRequest = createRequestHandler({
                build: remixBuild,
                mode: env.NODE_ENV || 'production',
                getLoadContext: () =>
                    createAppLoadContext(request, env, executionContext),
            });

            const response = await handleRequest(request);

            return response;
        } catch (error) {
            console.error(error);
            return new Response('An unexpected error occurred', { status: 500 });
        }
    },
};
