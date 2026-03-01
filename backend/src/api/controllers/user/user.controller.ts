import { Hono } from 'hono';
import { userService } from '../../../services/user.service';
import { validateDto } from '../../../middleware/validator.middleware';
import { CreateUserDto } from '../../../types/dto/user.dto';


const app = new Hono<{ Variables: { validatedDto: any } }>();

app.post('/register', validateDto(CreateUserDto), async (c) => {
    const dto = c.get('validatedDto') as CreateUserDto;
    
    // Získání a ověření Firebase tokenu
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: 'Missing Authorization header' }, 401);
    }
    
    const AUTH_SERVICE_URL = (c.env as any)?.AUTH_SERVICE_URL || process.env.AUTH_SERVICE_URL;

    if (!AUTH_SERVICE_URL) {
        return c.json({ message: 'Auth service configuration missing' }, 500);
    }
    
    try {
        const response = await fetch(`${AUTH_SERVICE_URL}/verify`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Auth microservice registration error:", errorText);
            return c.json({ message: 'Invalid token or error from auth service' }, 401);
        }

        const data = await response.json() as { valid: boolean, uid: string };
        const firebaseUid = data.uid;
        
        const user = await userService.createUser(firebaseUid, dto);
        return c.json({ message: 'User signed in / registered successfully', user }, 201);
    } catch (error) {
        console.error("Auth service connection error:", error);
        return c.json({ message: 'Could not connect to auth service or error creating user', error }, 500);
    }
});

app.get('/:uid', async (c) => {
    const uid = c.req.param('uid');
    try {
        const user = await userService.getUserByFirebaseUid(uid);
        if (!user) {
            return c.json({ message: 'User not found' }, 404);
        }
        return c.json({ user }, 200);
    } catch (error) {
        return c.json({ message: 'Error getting user', error }, 500);
    }
});

export const userRoutes = app;
