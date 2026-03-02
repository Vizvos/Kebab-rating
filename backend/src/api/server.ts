/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { userRoutes } from './controllers/user/user.controller';
import { placeRoutes } from './controllers/place/place.controller';

type Bindings = {
    FRONTEND_URL: string;
    AUTH_SERVICE_URL: string;
    DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', async (c, next) => {
    const frontendUrl = c.env?.FRONTEND_URL || 'https://kebab-rating.pages.dev';
    const corsMiddleware = cors({
        origin: frontendUrl,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
        exposeHeaders: ['Content-Length'],
        maxAge: 600,
        credentials: true,
    });
    return corsMiddleware(c, next);
});

// Testovací endpoint
app.get('/', (c) => {
    return c.json({ 
        message: "Welcome to Kebab-rating API logic!",
        status: "OK",
        env: c.env ? "Production/Worker" : "Local/Node"
    });
});

// Hlavní rozcestníky (endpointy jsou definované v těchto souborech)
app.route('/users', userRoutes);
app.route('/places', placeRoutes);

export const server = app;
export default app;
