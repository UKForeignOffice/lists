import { searchLawyers } from "server/components/lists/searches/lawyers";
import { getParameterValue, removeQueryParameter } from "../../helpers";
import type { Request, Response } from "express";
import { searchFuneralDirectors } from "server/components/lists/searches/funeral-directors";
import { HttpException } from "server/middlewares/error-handlers";
import { searchTranslatorsInterpreters } from "server/components/lists/searches/translators-interpreters";

export async function get(req: Request, res: Response) {
  const { serviceType } = req.params;

  res.locals.answers = req.session.answers;

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
