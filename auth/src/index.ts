import { Hono } from 'hono';
import { createRemoteJWKSet, jwtVerify } from 'jose';

type Bindings = {
    FIREBASE_PROJECT_ID: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Cache list of public keys
const FIREBASE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const JWKS = createRemoteJWKSet(new URL(FIREBASE_JWKS_URL));

app.get('/', (c) => c.text('Auth Service is running!'));

app.post('/verify', async (c) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Missing or invalid Authorization header' }, 401);
    }

    const token = authHeader.split(' ')[1];
    const projectId = c.env.FIREBASE_PROJECT_ID || 'kebabrating'; // Nastaveno podle tvého screenshotu

    try {
        const { payload } = await jwtVerify(token, JWKS, {
            issuer: `https://securetoken.google.com/${projectId}`,
            audience: projectId,
        });

        // Payload obsahuje Firebase token data
        return c.json({ 
            valid: true,
            uid: payload.user_id || payload.sub,
            email: payload.email,
            phone_number: payload.phone_number,
            payload 
        });

    } catch (error: any) {
        console.error('JWT Verification error:', error.message);
        return c.json({ error: 'Invalid or expired token', details: error.message }, 401);
    }
});

export default app;
