import { searchLawyers } from "server/components/lists/searches/lawyers";
import { getParameterValue, removeQueryParameter } from "../../helpers";
import type { Request, Response } from "express";

export async function get(req: Request, res: Response) {
  const context = await searchLawyers(req);
  const { country } = req.params;

  req.session.answers = {
    ...req.session.answers,
    country,
    region: req.query.region as string,
    practiceAreas: req.query["practice-area"] as string,
  };

  res.locals.answers = {
    ...req.session.answers,
  };

  res.render("lists/find/lawyers/results.njk", { ...context, removeQueryParameter, getParameterValue });
}
