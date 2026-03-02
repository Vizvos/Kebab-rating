import 'reflect-metadata';
import app from './api/server';

export default {
    async fetch(request: Request, env: any, ctx: any) {
        // Předáme vyřízení požadavku našemu Hono routeru
        // Hono nyní získá přístup přes c.env.DB
        return app.fetch(request, env, ctx);
    }
}
