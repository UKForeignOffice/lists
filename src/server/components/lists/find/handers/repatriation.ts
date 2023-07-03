import type { Request, Response } from "express";

export function get(req: Request, res: Response) {
  res.render("lists/find/funeral-directors/repatriation", {
    answers: req.session.answers,
  });
}

export function post(req: Request, res: Response) {
  const { repatriation } = req.body;
  const allowedValues = ["yes", "no"];

  if (!repatriation || !allowedValues.includes(repatriation)) {
    req.flash("error", "You must select whether the deceased had insurance or not");
    res.redirect("repatriation");
    return;
  }

  req.session.answers!.funeralDirectors.repatriation = repatriation === "yes";

  res.redirect("country");
}
