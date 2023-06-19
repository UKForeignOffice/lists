import { searchLawyers } from "server/components/lists/searches/lawyers";
import { getParameterValue, removeQueryParameter } from "../../helpers";
import type { Request, Response } from "express";
import { searchFuneralDirectors } from "server/components/lists/searches/funeral-directors";
import { HttpException } from "server/middlewares/error-handlers";

export async function get(req: Request, res: Response) {
  const { country, serviceType } = req.params;

  req.session.answers = {
    ...req.session.answers,
    country,
    region: req.query.region as string,
    practiceAreas: req.query["practice-area"] as string,
    reparation: req.query.reparation as string,
  };

  res.locals.answers = {
    ...req.session.answers,
  };

  const serviceTypeToSearch = {
    lawyers: searchLawyers,
    "funeral-directors": searchFuneralDirectors,
  };

  const searchMethod = serviceTypeToSearch[serviceType];

  if (!searchMethod) {
    throw new HttpException(400, "400", "");
  }

  const context = await searchMethod(req);

  res.render(`lists/find/${serviceType}/results.njk`, { ...context, removeQueryParameter, getParameterValue });
}
