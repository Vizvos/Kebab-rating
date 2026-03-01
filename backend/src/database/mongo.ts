import { MongoClient } from 'mongodb';
import { Config } from '../../config';

class MongoDatabase {
    private client: MongoClient | null = null;
    private _db: any = null;

    constructor() {}

    async connect(uri: string) {
        if (this.client && this._db) return; // Už jsme připojeni
        
        try {
            console.log("Connecting to MongoDB Atlas...");
            this.client = new MongoClient(uri);
            await this.client.connect();
            this._db = this.client.db();
            console.log("Successfully connected to MongoDB Atlas!");
        } catch (error) {
            console.error("MongoDB Atlas connection error:", error);
            throw error;
        }
    }

    get db() {
        if (!this._db) {
            throw new Error("Database not connected. Connection must be established first.");
        }
        return this._db;
    }
}

const mongo = new MongoDatabase();
export default mongo;
