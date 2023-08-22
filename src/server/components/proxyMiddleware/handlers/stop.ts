import type { Request, Response } from "express";
import { serviceTypeSchema } from "server/components/proxyMiddleware/helpers";

export function get(req: Request, res: Response) {
  const { value: serviceType } = serviceTypeSchema.validate(req.params.serviceType);
  const serviceTitles = {
    lawyers: "lawyers",
    "funeral-directors": "funeral directors",
    "translators-interpreters": "translators and interpreters",
  };

  res.render("apply/not-accepting-currently", {
    backLink: `/application/${serviceType}/which-country-list-do-you-want-to-be-added-to`,
    country: req.session?.application?.country,
    serviceTitle: serviceTitles[serviceType as keyof typeof serviceTitles],
  });
}
