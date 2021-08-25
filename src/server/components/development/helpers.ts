import { Express } from "express";
import { developmentRouter } from "./router";

export async function initDevelopment(server: Express): Promise<void> {
  server.use(developmentRouter);
}
