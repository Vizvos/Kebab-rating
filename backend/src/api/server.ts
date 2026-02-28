import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { userRoutes } from './controllers/user/user.controller';
import { placeRoutes } from './controllers/place/place.controller';

const app = new Hono();

app.use('*', cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.get('/', (c) => {
    return c.json({ 
        message: "Welcome to Kebab-rating API logic!",
        status: "OK" 
    });
});

app.route('/users', userRoutes);
app.route('/places', placeRoutes);

export const server = app;
export default app;
