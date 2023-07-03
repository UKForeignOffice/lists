import { searchLawyers } from "server/components/lists/searches/lawyers";
import { getParameterValue, removeQueryParameter } from "../../helpers";
import type { Request, Response } from "express";
import { searchFuneralDirectors } from "server/components/lists/searches/funeral-directors";
import { HttpException } from "server/middlewares/error-handlers";
import { sanitisePracticeAreas } from "server/components/lists/find/helpers/sanitisePracticeAreas";
import { searchTranslatorsInterpreters } from "server/components/lists/searches/translators-interpreters";

export async function get(req: Request, res: Response) {
  const { country, serviceType } = req.params;

  const region = req.query.region ?? "";
  /**
   * set `session.answers` if user landed on results page directly
   */
  req.session.answers = {
    ...req.session.answers,
    country,
    region: decodeURIComponent(region as string),
    practiceAreas: sanitisePracticeAreas(req.query["practice-area"] as string).toString(),
    repatriation: req.query.repatriation as string,
  };

  res.locals.answers = {
    ...req.session.answers,
  };

  const serviceTypeToSearch: { [key: string]: (req: Request) => any } = {
    lawyers: searchLawyers,
    "funeral-directors": searchFuneralDirectors,
    "translators-interpreters": searchTranslatorsInterpreters,
  };

  const searchMethod = serviceTypeToSearch[serviceType];

  if (!searchMethod) {
    throw new HttpException(400, "400", "");
  }

  const context = await searchMethod(req);

  res.render(`lists/find/${serviceType}/results.njk`, { ...context, removeQueryParameter, getParameterValue });
}
