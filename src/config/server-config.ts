import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT ?? 3000;
export const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";
export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const DEBUG = process.env.DEBUG === "true";
