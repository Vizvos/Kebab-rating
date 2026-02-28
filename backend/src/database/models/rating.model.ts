import { ObjectId } from "mongodb";

export interface Rating {
    _id?: ObjectId;
    foodName: string;
    score: number; // 0-10
    description: string;
    placeId: ObjectId; // Reference to Place
    userId: ObjectId; // Reference to User
    createdAt: Date;
}
