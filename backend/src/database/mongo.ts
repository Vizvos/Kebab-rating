import { MongoClient } from 'mongodb';
import { Config } from '../../config';

class MongoDatabase {
    private client: MongoClient | null = null;

    constructor() {}

    async connect(uriOverride?: string) {
        const uri = uriOverride || Config.mongoUri;
        if (!uri) {
            throw new Error("MongoDB URI is required but was not provided.");
        }
        try {
            this.client = new MongoClient(uri);
            console.log("Connecting to MongoDB...");
            await this.client.connect();
            console.log("Successfully connected to MongoDB!");
        } catch (error) {
            console.error("MongoDB connection error:", error);
            // V produkci nechceme exit(1) na Workeru, pokud to lze řešit jinak, ale prozatím ponecháme logiku
            throw error;
        }
    }

    get db() {
        if (!this.client) {
            throw new Error("Database not connected. Call connect() first.");
        }
        return this.client.db();
    }
}

const mongo = new MongoDatabase();
export default mongo;
