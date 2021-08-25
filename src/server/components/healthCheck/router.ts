import express from "express";
import { healthCheckRoutes } from "./routes";

export const healthCheckRouter = express.Router();

healthCheckRouter.get(healthCheckRoutes.healthCheck, (req, res) => {
  res.send({ status: "OK" });
});

healthCheckRouter.get(healthCheckRoutes.ping, (req, res) => {
  res.send({ status: "OK" });
});
