import type { NextFunction, Request, Response } from "express";

export function returnToResults(req: Request, res: Response, next: NextFunction) {
  if (req.params.return === "results") {
    res.redirect("results");
    return;
  }
  next();
}
