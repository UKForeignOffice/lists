import { Express } from "express";
import { staticRouter } from "./router";

export async function initStaticRoutes(server: Express): Promise<void> {
  server.use(staticRouter);
}
