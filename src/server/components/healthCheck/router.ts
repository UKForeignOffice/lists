import express from "express";
import { healthCheckRoutes } from "./routes";

export const healthCheckRouter = express.Router();

healthCheckRouter.get(healthCheckRoutes.healthCheck, (_req, res) => {
  const { DOCKER_TAG = "v0.0.0-development" } = process.env;
  const date = new Date();
  const uptime = process.uptime();

  res.send({
    time: date.toUTCString(),
    uptime,
    version: DOCKER_TAG,
    status: "OK",
  });
});

healthCheckRouter.get(healthCheckRoutes.ping, (_req, res) => {
  res.send({
    status: "OK",
  });
});
