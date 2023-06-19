import type { NextFunction, Request, Response } from "express";

export function get(req: Request, res: Response, Next: NextFunction) {
  res.render("lists/find/funeral-directors/contact-insurance.njk");
}

export function post(req: Request, res: Response, Next: NextFunction) {}
