import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Context, Next } from 'hono';

export const validateDto = (dtoClass: any) => {
    return async (c: Context, next: Next) => {
        try {
            const body = await c.req.json();
            const dtoObj = plainToInstance(dtoClass, body);
            const errors = await validate(dtoObj);

            if (errors.length > 0) {
                const errorMessages = errors.map((error: ValidationError) =>
                    Object.values(error.constraints || {}).join(', ')
                );
                return c.json({ message: 'Validation failed', errors: errorMessages }, 400);
            }
            
            // Přidáme validovaný objekt do kontextu, aby byl dostupný pro handler
            c.set('validatedDto' as any, dtoObj);
            await next();
        } catch (error) {
            return c.json({ message: 'Invalid JSON body' }, 400);
        }
    };
};
