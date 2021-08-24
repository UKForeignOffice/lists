import { Express } from "express";
import healthCheckRouter from "./health-check";
import { listsRouter } from "../components/lists/router";
import developmentRouter from "./development";
import { sitemapRouter } from "server/components/sitemap";
import dashboardRouter from "./dashboard";
import { cookiesRouter } from "server/components/cookies";

export const configureRouter = (server: Express): void => {
  server.use(healthCheckRouter);
  server.use(listsRouter);
  server.use(sitemapRouter);
  server.use(developmentRouter);
  server.use(dashboardRouter);
  server.use(cookiesRouter);
};
