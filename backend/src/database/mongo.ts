import { MongoClient } from 'mongodb';
import { Config } from '../../config';

class MongoDatabase {
    private client: MongoClient | null = null;
    private _db: any = null;
    private connectionPromise: Promise<void> | null = null;

    constructor() {}

    async connect(uri: string) {
        if (this._db) return;

        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = (async () => {
            try {
                // Konfigurace pro Cloudflare Workers v roce 2026:
                // Menší timeouty zajistí, že se Worker nezasekne, pokud Atlas neodpovídá.
                this.client = new MongoClient(uri, {
                    serverSelectionTimeoutMS: 5000,
                    connectTimeoutMS: 5000,
                    socketTimeoutMS: 30000,
                    maxPoolSize: 1 // Na Workeru chceme malý pool
                });

                await this.client.connect();
                this._db = this.client.db();
                console.log("Connected to MongoDB via Native TCP!");
            } catch (error) {
                console.error("MongoDB Connection Failed:", error);
                this.client = null;
                this._db = null;
                this.connectionPromise = null;
                throw error;
            }
        })();

        return this.connectionPromise;
    }

    get db() {
        if (!this._db) {
            throw new Error("DB_NOT_CONNECTED");
        }
        return this._db;
    }
}

const mongo = new MongoDatabase();
export default mongo;
