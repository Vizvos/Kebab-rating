import { collections } from '../database/collections';
import { CreatePlaceDto } from '../types/dto/place.dto';
import { ObjectId } from 'mongodb';

export class PlaceService {
    async createPlace(creatorId: string, dto: CreatePlaceDto) {
        const creatorObjId = new ObjectId(creatorId);
        
        const newPlace = {
            name: dto.name,
            address: dto.address,
            lat: dto.lat,
            lon: dto.lon,
            rating: 0,
            ratings: [],
            creatorId: creatorObjId,
            createdAt: new Date()
        };

        const result = await collections.places.insertOne(newPlace);
        
        // Zapsat createdPlace id do user objektu (volitelně)
        await collections.users.updateOne(
            { _id: creatorObjId },
            { $push: { createdPlaces: result.insertedId } }
        );

        return { ...newPlace, _id: result.insertedId };
    }

    async getAllPlaces() {
        return await collections.places.find({}).toArray();
    }

    async getPlaceById(id: string) {
        return await collections.places.findOne({ _id: new ObjectId(id) });
    }

    async updatePlaceAverageRating(placeId: ObjectId) {
        const ratings = await collections.ratings.find({ placeId }).toArray();
        if (ratings.length === 0) {
            await collections.places.updateOne({ _id: placeId }, { $set: { rating: 0 } });
            return;
        }

        const totalScore = ratings.reduce((sum, current) => sum + current.score, 0);
        const average = Number((totalScore / ratings.length).toFixed(1)); // zaokrouhlíme na 1 desetinné místo

        await collections.places.updateOne(
            { _id: placeId }, 
            { $set: { rating: average } }
        );
    }
}

export const placeService = new PlaceService();
