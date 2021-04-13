import dotenv from "dotenv";

dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL;
export const POPULATE_DB = process.env.POPULATE_DB === "true";
