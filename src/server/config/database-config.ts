import dotenv from "dotenv";

dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL;
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = Number(process.env.REDIS_PORT);
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const REDIS_TLS = process.env.REDIS_TLS === "true";
export const REDIS_CLUSTER_MODE =
  process.env.REDIS_CLUSTER_MODE === ("true" || true);
