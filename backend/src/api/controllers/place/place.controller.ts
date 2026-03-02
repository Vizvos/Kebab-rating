import { Hono } from 'hono';
import { placeService } from '../../../services/place.service';
import { ratingService } from '../../../services/rating.service';
import { validateDto } from '../../../middleware/validator.middleware';
import { requireAuth } from '../../../middleware/auth.middleware';
import { CreatePlaceDto } from '../../../types/dto/place.dto';
import { CreateRatingDto } from '../../../types/dto/rating.dto';
import { User } from '../../../database/models/user.model';

const app = new Hono<{ Bindings: { DB: D1Database }, Variables: { validatedDto: any, user: any } }>();

// Získání všech Place pro zobrazení na mapě jako POI
app.get('/', async (c) => {
    try {
        const places = await placeService.getAllPlaces(c.env.DB);
        return c.json({ places }, 200);
    } catch (error) {
        return c.json({ message: 'Error getting places', error }, 500);
    }
});

// Získání konkrétního detailu Place (při kliknutí na POI)
app.get('/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const place = await placeService.getPlaceById(c.env.DB, id);
        if (!place) {
            return c.json({ message: 'Place not found' }, 404);
        }
        
        // Načtení pole recenzí pod tímto detailem
        const ratings = await ratingService.getRatingsForPlace(c.env.DB, id);
        
        return c.json({ place, ratings }, 200);
    } catch (error) {
        return c.json({ message: 'Error getting place', error }, 500);
    }
});

// Přidání nového Place na mapu
app.post('/', requireAuth, validateDto(CreatePlaceDto), async (c) => {
    const dto = c.get('validatedDto') as CreatePlaceDto;
    const user = c.get('user') as any;
    
    try {
        const place = await placeService.createPlace(c.env.DB, user.id || user._id, dto);
        return c.json({ message: 'Place created', place }, 201);
    } catch (error) {
        return c.json({ message: 'Error creating place', error }, 500);
    }
});

// Přidání ratingu konkrétnímu podniku
app.post('/:id/ratings', requireAuth, validateDto(CreateRatingDto), async (c) => {
    const placeId = c.req.param('id');
    const dto = c.get('validatedDto') as CreateRatingDto;
    const user = c.get('user') as any;

    try {
        const placeExists = await placeService.getPlaceById(c.env.DB, placeId);
        if (!placeExists) return c.json({ message: 'Place not found' }, 404);

        const rating = await ratingService.createRating(c.env.DB, user.id || user._id, placeId, dto);
        return c.json({ message: 'Rating added', rating }, 201);
    } catch (error) {
        return c.json({ message: 'Error adding rating', error }, 500);
    }
});

export const placeRoutes = app;
