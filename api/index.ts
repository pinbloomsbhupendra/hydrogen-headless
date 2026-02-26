import server from '../build/server/index.js';

export const config = {
    runtime: 'edge',
};

export default async function (request) {
    try {
        return await server.fetch(request, process.env, {
            waitUntil: (promise) => Promise.resolve(promise),
        });
    } catch (error) {
        console.error('Vercel Edge Runtime Error:', error);
        return new Response('An unexpected error occurred: ' + error.message, { status: 500 });
    }
}
