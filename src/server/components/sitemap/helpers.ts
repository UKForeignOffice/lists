import { Express } from "express";
import { sitemapRouter } from "./router";

export async function initSitemap(server: Express): Promise<void> {
  server.use(sitemapRouter);
}
