import { MongoClient } from 'mongodb';
import { Config } from '../../config';

class MongoDatabase {
    private client: MongoClient;

    constructor() {
        this.client = new MongoClient(Config.mongoUri);
    }

    async connect(uriOverride?: string) {
        try {
            if (uriOverride) {
                this.client = new MongoClient(uriOverride);
            }
            console.log("Connecting to MongoDB...");
            await this.client.connect();
            console.log("Successfully connected to MongoDB Workspace!");
        } catch (error) {
            console.error("MongoDB connection error:", error);
            process.exit(1);
        }
    }

    get db() {
        return this.client.db();
    }
}

const mongo = new MongoDatabase();
export default mongo;
