import type { NextFunction, Request, Response } from "express";
import { URLSearchParams } from "url";

export function get(req: Request, res: Response, Next: NextFunction) {
  res.render("lists/find/funeral-directors/repatriation");
}

export function post(req: Request, res: Response, Next: NextFunction) {
  const { repatriation } = req.body;
  const allowedValues = ["yes", "no"];

  if (!repatriation || !allowedValues.includes(repatriation)) {
    req.flash("error", "You must select whether the deceased had insurance or not");
    res.redirect("repatriation");
    return;
  }

  req.session.answers.repatriation = repatriation === "yes";

  // @ts-ignore
  const query = new URLSearchParams({ ...req.query, repatriation });

  res.redirect(`../country?${query.toString()}`);
}
