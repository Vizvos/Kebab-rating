import 'reflect-metadata';
import { serve } from '@hono/node-server';
import { server } from './api/server';
import mongo from "./database/mongo";
import { Config } from "../config";

const port = Number(Config.port) || 3000;

async function init() {
    // 1. First initialize the db connection
    await mongo.connect();

    // 2. Start the Hono server using Node.js adapter
    serve({
        fetch: server.fetch,
        port
    }, (info) => {
        console.log(`Listening on http://localhost:${info.port}`);
    });
}

init();
