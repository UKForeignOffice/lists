import { Express } from "express";
import healthCheckRouter from "./health-check";
import developmentRouter from "./development";
import { listsRouter } from "../components/lists/router";
import { sitemapRouter } from "server/components/sitemap";
import { dashboardRouter } from "../components/dashboard";
import { cookiesRouter } from "server/components/cookies";
import feedbackRouter from "./feedback";

export const configureRouter = (server: Express): void => {
  server.use(healthCheckRouter);
  server.use(listsRouter);
  server.use(sitemapRouter);
  server.use(developmentRouter);
  server.use(dashboardRouter);
  server.use(cookiesRouter);
  server.use(feedbackRouter);
};
