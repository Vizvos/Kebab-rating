import 'reflect-metadata';
import app from './api/server';
import mongo from './database/mongo';

let isDbConnected = false;

export default {
    async fetch(request: Request, env: any, ctx: any) {
        // Zde si musíme pro Workers nastavit prostředí
        // 1. Zabezpečíme spojení s databází před vyřízením požadavku
        if (!isDbConnected) {
            // Použijeme MONGO_URI z Cloudflare environment vars (env) pokud existují, jinak lokální process.env z Node
            const mongoUri = env.MONGO_URI || process.env.MONGO_URI;
            if (mongoUri) {
                try {
                    // Připojení Mongo Driveru (když je povolen nodejs_compat string)
                    await mongo.connect(mongoUri);
                    isDbConnected = true;
                    console.log("Connected to MongoDB from Worker!");
                } catch (error) {
                    console.error("MongoDB start error in worker:", error);
                }
            } else {
                console.warn("MONGO_URI is missing. Database functionality will not be available.");
            }
        }

        // 2. Předáme vyřízení požadavku našemu Hono routeru
        return app.fetch(request, env, ctx);
    }
}
