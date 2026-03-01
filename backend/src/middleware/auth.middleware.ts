import { Context, Next } from 'hono';
import { userService } from '../services/user.service';

export const requireAuth = async (c: Context, next: Next) => {
    // Prozatím jednoduše načteme firebaseUid z hlavičky (nebo body) jako mock autentizace
    // V produkci by se token z hlavičky ověřil pŕes Firebase Admin SDK
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: 'Missing Authorization header' }, 401);
    }

    // V zkušebním nebo local dev prostředí se dá toto částečně vypnout (podle env variable), ale pro produkci:
    const AUTH_MICROSERVICE_URL = (c.env as any)?.AUTH_MICROSERVICE_URL || process.env.AUTH_MICROSERVICE_URL || 'http://127.0.0.1:8787/verify';

    try {
        const response = await fetch(AUTH_MICROSERVICE_URL, {
            method: 'POST',
            headers: {
                'Authorization': authHeader
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Auth microservice error:", errorText);
            return c.json({ message: 'Invalid or expired Authorization token' }, 401);
        }

        const data = await response.json() as { valid: boolean, uid: string, email: string };
        const firebaseUid = data.uid; 
        
        // Zkusíme najít usera v databázi, kterým prošel registrací
        const user = await userService.getUserByFirebaseUid(firebaseUid);
        
        if (!user) {
            return c.json({ message: 'User not found in database. Complete registration first.' }, 401);
        }

        // Uložíme usera do kontextu requestu pro další zpracování
        c.set('user' as any, user);
        
        await next();
    } catch (error) {
        console.error("Auth Microservice Connection Error:", error);
        return c.json({ message: 'Could not connect to auth microservice' }, 500);
    }
};
