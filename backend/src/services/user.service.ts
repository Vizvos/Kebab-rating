import { collections } from '../database/collections';
import { CreateUserDto } from '../types/dto/user.dto';
import { ObjectId } from 'mongodb';

export class UserService {
    async createUser(firebaseUid: string, dto: CreateUserDto) {
        // Občas může firebaseUid už existovat při dalším přihlášení, ideálně jej updatneme nebo vrátíme existující
        const existing = await collections.users.findOne({ firebaseUid });
        if (existing) {
            return existing;
        }

        const newUser = {
            firebaseUid: firebaseUid,
            name: dto.name,
            ratings: [],
            createdPlaces: [],
            isAdmin: false,
            createdAt: new Date()
        };

        const result = await collections.users.insertOne(newUser);
        return { ...newUser, _id: result.insertedId };
    }

    async getUserByFirebaseUid(firebaseUid: string) {
        return await collections.users.findOne({ firebaseUid });
    }

    async getUserById(id: string) {
        return await collections.users.findOne({ _id: new ObjectId(id) });
    }
}

export const userService = new UserService();
