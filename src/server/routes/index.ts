import { Express } from "express";
import homeRouter from "./home";
import healthCheckRouter from "./health-check";

export const configureRouter = (server: Express): void => {
  server.use(homeRouter);
  server.use(healthCheckRouter);
};
