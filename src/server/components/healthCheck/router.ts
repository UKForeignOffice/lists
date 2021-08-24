import express from "express";

export const healthCheckRouter = express.Router();

healthCheckRouter.get("/health-check", (req, res) => {
  res.send({ status: "OK" });
});

healthCheckRouter.get("/ping", (req, res) => {
  res.send({ status: "OK" });
});
