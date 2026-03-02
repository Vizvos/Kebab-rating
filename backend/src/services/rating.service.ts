/// <reference types="@cloudflare/workers-types" />
import { CreateRatingDto } from '../types/dto/rating.dto';
import { placeService } from './place.service';

export class RatingService {
    async createRating(db: D1Database, userId: string, placeId: string, dto: CreateRatingDto) {
        const newId = crypto.randomUUID();

        await db.prepare(`
            INSERT INTO ratings (id, place_id, user_id, food_name, score, description)
            VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(newId, String(placeId), String(userId), dto.foodName ? String(dto.foodName) : null, Number(dto.score), dto.description ? String(dto.description) : null)
        .run();

        // Přepočítat průměr hodnocení tohoto podniku
        await placeService.updatePlaceAverageRating(db, placeId);

        return { _id: newId, id: newId, placeId, userId, foodName: dto.foodName, score: dto.score, description: dto.description };
    }

    async getRatingsForPlace(db: D1Database, placeId: string) {
        // Získat i autora přes JOIN
        const result = await db.prepare(`
            SELECT r.*, u.name as authorName 
            FROM ratings r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.place_id = ?
            ORDER BY r.created_at DESC
        `).bind(String(placeId)).all();
        
        // Zpětná kompatibilita pro frontend s _id
        return result.results.map(row => ({ ...row, _id: row.id }));
    }
}

export const ratingService = new RatingService();
