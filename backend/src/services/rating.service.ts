import { collections } from '../database/collections';
import { CreateRatingDto } from '../types/dto/rating.dto';
import { ObjectId } from 'mongodb';
import { placeService } from './place.service';

export class RatingService {
    async createRating(userId: string, placeId: string, dto: CreateRatingDto) {
        const userObjId = new ObjectId(userId);
        const placeObjId = new ObjectId(placeId);

        const newRating = {
            foodName: dto.foodName,
            score: dto.score,
            description: dto.description,
            placeId: placeObjId,
            userId: userObjId,
            createdAt: new Date()
        };

        const result = await collections.ratings.insertOne(newRating);
        const insertedId = result.insertedId;

        // 1. Zapsat id ratingu do pole ratingu na Place objektu
        await collections.places.updateOne(
            { _id: placeObjId },
            { $push: { ratings: insertedId } }
        );

        // 2. Přepočítat průměr hodnocení tohoto podniku
        await placeService.updatePlaceAverageRating(placeObjId);

        // 3. Přidat rating do profilu Usera
        await collections.users.updateOne(
            { _id: userObjId },
            { $push: { ratings: insertedId } }
        );

        return { ...newRating, _id: insertedId };
    }

    async getRatingsForPlace(placeId: string) {
        return await collections.ratings.aggregate([
            { $match: { placeId: new ObjectId(placeId) } },
            { 
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $unwind: { path: "$author", preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: { authorName: "$author.name" }
            },
            {
                $project: { author: 0 }
            }
        ]).toArray();
    }
}

export const ratingService = new RatingService();
