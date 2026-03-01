import 'dotenv/config';

export const Config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI || ""
};
