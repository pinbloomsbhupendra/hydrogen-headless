import { createCookieSessionStorage } from 'react-router';

/**
 * Configure session storage using Hydrogen's createCookieSessionStorage.
 * @param {Object} env - Environment variables containing SESSION_SECRET
 */
export function createAppSession(env) {
    return createCookieSessionStorage({
        cookie: {
            name: '__session',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            secrets: [env.SESSION_SECRET],
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
