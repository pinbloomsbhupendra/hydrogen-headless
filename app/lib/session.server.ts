import { createCookieSessionStorage } from 'react-router';

/**
 * Configure session storage using Hydrogen's createCookieSessionStorage.
 * @param {Object} env - Environment variables containing SESSION_SECRET
 */
export function createAppSession(env) {
    const isProduction = env.NODE_ENV === 'production';

    return createCookieSessionStorage({
        cookie: {
            name: 'prolock_cart_session',
            httpOnly: false,
            // Disable secure flag for local development to ensure cookies work on http://localhost:3000
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            secrets: [env.SESSION_SECRET || 'default_secret_for_dev'],
        },
    });
}

/**
 * Helper to get the session from the request
 * @param {Request} request 
 * @param {Object} env 
 */
export async function getSession(request, env) {
    const storage = createAppSession(env);
    return storage.getSession(request.headers.get('Cookie'));
}

/**
 * Helper to commit the session
 * @param {Session} session 
 * @param {Object} env 
 */
export async function commitSession(session, env) {
    const storage = createAppSession(env);
    return storage.commitSession(session);
}

/**
 * Helper to destroy the session
 * @param {Session} session 
 * @param {Object} env 
 */
export async function destroySession(session, env) {
    const storage = createAppSession(env);
    return storage.destroySession(session);
}
