/// <reference types="@cloudflare/workers-types" />
import { CreateUserDto } from '../types/dto/user.dto';

export class UserService {
    async createUser(db: D1Database, firebaseUid: string, dto: CreateUserDto) {
        // Kontrola, zda neexistuje
        const existingInfo = await db.prepare("SELECT * FROM users WHERE firebase_uid = ?")
            .bind(String(firebaseUid))
            .first();

        if (existingInfo) {
            return existingInfo;
        }

        const newId = crypto.randomUUID();
        const newName = String(dto.name);
        const fUid = String(firebaseUid);

        await db.prepare("INSERT INTO users (id, firebase_uid, name, is_admin) VALUES (?, ?, ?, 0)")
            .bind(newId, fUid, newName)
            .run();

        return { id: newId, firebaseUid: fUid, name: newName, is_admin: 0 };
    }

    async getUserByFirebaseUid(db: D1Database, firebaseUid: string) {
         return await db.prepare("SELECT * FROM users WHERE firebase_uid = ?")
            .bind(String(firebaseUid))
            .first();
    }

    async getUserById(db: D1Database, id: string) {
        return await db.prepare("SELECT * FROM users WHERE id = ?")
            .bind(String(id))
            .first();
    }
}

export const userService = new UserService();
