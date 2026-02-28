import { ObjectId } from "mongodb";

export interface Place {
    _id?: ObjectId;
    name: string;
    rating: number; // calculated average
    address?: string;
    ratings: ObjectId[]; // Array of ObjectId for Ratings
    lat: number;
    lon: number;
    creatorId: ObjectId; // reference to User who created the place
    createdAt: Date;
}
