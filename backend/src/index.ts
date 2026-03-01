import 'reflect-metadata';
import app from './api/server';
import mongo from './database/mongo';

let isDbConnected = false;

export default {
    async fetch(request: Request, env: any, ctx: any) {
        // Zde si musíme pro Workers nastavit prostředí
        // 1. Zabezpečíme spojení s databází před vyřízením požadavku
        // Zabezpečíme spojení s databází před vyřízením jakéhokoli požadavku
        const mongoUri = env.MONGO_URI || process.env.MONGO_URI;
        if (mongoUri) {
            try {
                await mongo.connect(mongoUri);
            } catch (error) {
                console.error("MongoDB critical connection error:", error);
            }
        }

        // 2. Předáme vyřízení požadavku našemu Hono routeru
        return app.fetch(request, env, ctx);
    }
}
