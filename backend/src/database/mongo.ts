import { MongoClient } from 'mongodb';
import { Config } from '../../config';

class MongoDatabase {
    private client: MongoClient | null = null;
    private _db: any = null;
    private connectionPromise: Promise<void> | null = null;

    constructor() {}

    async connect(uri: string) {
        // Pokud už jsme připojeni, nic neděláme
        if (this._db) return;

        // Pokud se právě připojujeme, počkáme na stávající proces
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        // Jinak zahájíme nové připojení
        this.connectionPromise = (async () => {
            try {
                this.client = new MongoClient(uri);
                await this.client.connect();
                this._db = this.client.db();
            } catch (error) {
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
            throw new Error("Database not connected. Connection must be established first.");
        }
        return this._db;
    }
}

const mongo = new MongoDatabase();
export default mongo;
