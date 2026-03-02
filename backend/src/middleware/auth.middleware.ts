import { Context, Next } from 'hono';
import { userService } from '../services/user.service';

export const requireAuth = async (c: Context, next: Next) => {
    // Prozatím jednoduše načteme firebaseUid z hlavičky (nebo body) jako mock autentizace
    // V produkci by se token z hlavičky ověřil pŕes Firebase Admin SDK
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: 'Missing Authorization header' }, 401);
    }

    const AUTH_SERVICE = (c.env as any)?.AUTH_SERVICE;
    
    if (!AUTH_SERVICE) {
        console.error("AUTH_SERVICE binding is missing in environment!");
        return c.json({ message: 'Internal Server Error: Auth configuration missing' }, 500);
    }

    try {
        const response = await AUTH_SERVICE.fetch('https://auth/verify', {
            method: 'POST',
            headers: {
                'Authorization': authHeader
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Auth microservice error:", errorText);
            return c.json({ 
                message: 'Autentizace selhala', 
                detail: errorText, 
                code: 'AUTH_VERIFY_FAILED' 
            }, 401);
        }

        const data = await response.json() as { valid: boolean, uid: string, email: string };
        const firebaseUid = data.uid; 
        
        // Zkusíme najít usera v databázi
        let user: any = await userService.getUserByFirebaseUid((c.env as any).DB, firebaseUid);
        
        // --- OPRAVA: Pokud uživatel neexistuje, vytvoříme ho na letu ---
        if (!user) {
            console.log(`User ${firebaseUid} not found in DB, auto-creating...`);
            user = await userService.createUser((c.env as any).DB, firebaseUid, { 
                name: data.email?.split('@')[0] || 'KebabLover' 
            });
        }

        // Uložíme usera do kontextu
        c.set('user' as any, user);
        
        await next();
    } catch (error) {
        console.error("Auth Service Connection Error:", error);
        return c.json({ message: 'Could not connect to auth service' }, 500);
    }
};
