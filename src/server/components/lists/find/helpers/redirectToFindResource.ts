import type { NextFunction, Request, Response } from "express";
import { getRedirectIfListIsEmpty } from "server/components/lists/find/helpers/getRedirectIfListIsEmpty";
import { getDbServiceTypeFromParameter } from "server/components/lists/searches/helpers/getDbServiceTypeFromParameter";

export async function redirectToFindResource(req: Request, res: Response, next: NextFunction) {
  const { serviceType, country } = req.session.answers ?? {};
  if (!serviceType) {
    res.status(400);
    next();
    return;
  }

  if (!country) {
    /**
     * TODO: Change to 301 for the next release cycle after 1.91.0.
     */
    res.redirect(302, `/find/${serviceType}`);
    return;
  }

  const redirectIfEmptyList = await getRedirectIfListIsEmpty(country, getDbServiceTypeFromParameter(serviceType));

  if (redirectIfEmptyList) {
    res.redirect(redirectIfEmptyList);
    return;
  }

  /**
   * TODO: Change to 301 for the next release cycle after 1.91.0.
   */
  res.redirect(302, `/find/${serviceType}/${encodeURIComponent(country)}/result`);
}
