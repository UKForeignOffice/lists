import type { NextFunction, Request, Response } from "express";
import { getRedirectIfListIsEmpty } from "server/components/lists/find/helpers/getRedirectIfListIsEmpty";
import { getDbServiceTypeFromParameter } from "server/components/lists/searches/helpers/getDbServiceTypeFromParameter";

export async function redirectToFindResource(req: Request, res: Response, next: NextFunction) {
  const { serviceType, country } = req.session.answers ?? {};
  if (!serviceType) {
    res.status(400).send();
    return;
  }

  if (!country) {
    res.redirect(`/find/${serviceType}/country`);
    return;
  }

  const redirectIfEmptyList = await getRedirectIfListIsEmpty(country, getDbServiceTypeFromParameter(serviceType));

  if (redirectIfEmptyList) {
    res.redirect(redirectIfEmptyList);
    return;
  }
  console.log("redirecting to result");

  res.redirect(`/find/${serviceType}/${encodeURIComponent(country)}/result`);
}
