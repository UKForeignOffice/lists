import { Express } from "express";
import homeRouter from "./home";
import healthCheckRouter from "./health-check";
import serviceFinderRouter from "./service-finder";
import developmentRouter from "./development";

export const configureRouter = (server: Express): void => {
  server.use(homeRouter);
  server.use(healthCheckRouter);
  server.use(serviceFinderRouter);
  server.use(developmentRouter);
};
