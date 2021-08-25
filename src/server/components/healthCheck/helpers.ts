import { Express } from "express";
import { healthCheckRouter } from "./router";

export async function initHealthCheck(server: Express): Promise<void> {
  server.use(healthCheckRouter);
}
