import { ObjectId } from "mongodb";

export interface User {
    _id?: ObjectId;
    firebaseUid: string;
    name: string;
    ratings: ObjectId[]; // Array of ObjectId for Ratings
    createdPlaces: ObjectId[]; // Array of ObjectId for Places
    isAdmin: boolean;
    createdAt: Date;
}
