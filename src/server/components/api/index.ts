import type { Express } from "express";
import { apiRouter } from "./router";

export default function initApi(server: Express) {
  server.use(apiRouter);
}
