import { MongoClient } from 'mongodb';
import { Config } from '../../config';

class MongoDatabase {
    private client: MongoClient | null = null;
    private _db: any = null;

    constructor() {}

    async connect(uri: string) {
        if (this._db) return;
        
        try {
            if (!this.client) {
                this.client = new MongoClient(uri);
                await this.client.connect();
                this._db = this.client.db();
            }
        } catch (error) {
            this.client = null;
            this._db = null;
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
