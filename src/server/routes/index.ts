import { Express } from "express";
import healthCheckRouter from "./health-check";
import listsFinderRouter from "./lists";
import developmentRouter from "./development";
import sitemapRouter from "./sitemap";
import cookiesRouter from "./cookies";

export const configureRouter = (server: Express): void => {
  server.use(healthCheckRouter);
  server.use(listsFinderRouter);
  server.use(sitemapRouter);
  server.use(developmentRouter);
  server.use(cookiesRouter);
};
