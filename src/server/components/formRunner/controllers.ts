import type { RequestHandler } from "express";

export const statusController: RequestHandler = (_req, res) => {
  res.render("application/status");
};
