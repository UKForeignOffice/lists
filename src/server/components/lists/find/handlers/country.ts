import { countriesList } from "server/services/metadata";
import { validateCountry } from "server/models/listItem/providers/helpers";
import type { Request, Response } from "express";
import { getDbServiceTypeFromParameter } from "server/components/lists/searches/helpers/getDbServiceTypeFromParameter";
import { getRedirectIfListIsEmpty } from "server/components/lists/find/helpers/getRedirectIfListIsEmpty";

export function get(req: Request, res: Response) {
  res.render("lists/find/country", {
    countriesList,
    answers: req.session.answers,
  });
}

export async function post(req: Request, res: Response) {
  const { country } = req.body;
  const validatedCountry = validateCountry(country);
  if (!validatedCountry) {
    req.flash("error", "You must enter a country name");
    res.redirect(req.originalUrl);
    return;
  }

  const safe = encodeURIComponent(validatedCountry);

  // @ts-ignore
  req.session.answers.country = country;
  // @ts-ignore
  req.session.answers.urlSafeCountry = safe;

  const hasQuery = Object.keys(req.query).length;

  // @ts-ignore
  const query = new URLSearchParams(req.query);
  const queryString = hasQuery ? `?${query.toString()}` : "";

  const dbServiceType = getDbServiceTypeFromParameter(req.params.serviceType);

  const redirectIfEmptyList = await getRedirectIfListIsEmpty(country, dbServiceType);

  if (redirectIfEmptyList) {
    res.redirect(redirectIfEmptyList);
    return;
  }

  if (req.query.return === "results") {
    res.redirect("result");
    return;
  }

  res.redirect(`${safe}/region${queryString}`);
}
