/// <reference types="@cloudflare/workers-types" />
import { CreatePlaceDto } from '../types/dto/place.dto';

export class PlaceService {
    async createPlace(db: D1Database, creatorId: string, dto: CreatePlaceDto) {
        const newId = crypto.randomUUID();
        
        await db.prepare(`
            INSERT INTO places (id, name, address, lat, lon, rating, creator_id)
            VALUES (?, ?, ?, ?, ?, 0, ?)
        `)
        .bind(newId, String(dto.name), String(dto.address), Number(dto.lat), Number(dto.lon), String(creatorId))
        .run();

        return { _id: newId, id: newId, name: dto.name, address: dto.address, lat: dto.lat, lon: dto.lon, rating: 0, creatorId };
    }

    async getAllPlaces(db: D1Database) {
        const result = await db.prepare("SELECT * FROM places").all();
        // Mapping id to _id for frontend backward compatibility
        return result.results.map(row => ({ ...row, _id: row.id }));
    }

    async getPlaceById(db: D1Database, id: string) {
        const place = await db.prepare("SELECT * FROM places WHERE id = ?").bind(String(id)).first();
        if (place) return { ...place, _id: place.id };
        return null;
    }

    async updatePlaceAverageRating(db: D1Database, placeId: string) {
        const result = await db.prepare("SELECT score FROM ratings WHERE place_id = ?").bind(String(placeId)).all();
        const ratings = result.results;
        
        if (ratings.length === 0) {
            await db.prepare("UPDATE places SET rating = 0 WHERE id = ?").bind(String(placeId)).run();
            return;
        }

        const totalScore = ratings.reduce((sum: number, current: any) => sum + current.score, 0);
        const average = Number((totalScore / ratings.length).toFixed(1)); 

        await db.prepare("UPDATE places SET rating = ? WHERE id = ?")
            .bind(average, String(placeId))
            .run();
    }
}

export const placeService = new PlaceService();
