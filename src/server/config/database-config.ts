import dotenv from "dotenv";

dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = Number(process.env.REDIS_PORT);
