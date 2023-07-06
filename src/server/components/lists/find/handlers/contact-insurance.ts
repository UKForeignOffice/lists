import type { Request, Response } from "express";

export function get(req: Request, res: Response) {
  res.render("lists/find/funeral-directors/contact-insurance.njk");
}
