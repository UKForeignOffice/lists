import { URLSearchParams } from "url";
import type { Request, Response } from "express";
import { HttpException } from "server/middlewares/error-handlers";
import { logger } from "server/services/logger";

export function get(req: Request, res: Response) {
  res.render("lists/find/region", {
    region: req.session.answers?.region,
  });
}

export function post(req: Request, res: Response) {
  const { region } = req.body;
  const encoded = encodeURIComponent(region);

  const params = new URLSearchParams({
    ...req.query,
    ...(encoded && { region: encoded }),
  });

  const serviceType = req.params.serviceType;

  req.session.answers.region = region;

  if (req.session.answers?.disclaimer === true) {
    res.redirect(`result?${params.toString()}`);
    return;
  }

  const serviceTypeNextPage = {
    "funeral-directors": "disclaimer",
    lawyers: "insurance",
    translatorsInterpreters: undefined,
  };

  const nextPage = serviceTypeNextPage[serviceType];

  if (!nextPage) {
    logger.error(`POST ${req.originalUrl} - user requested next page for invalid service type "${serviceType}"`);
    throw new HttpException(404, "404", " ");
  }

  res.redirect(`${nextPage}?${params.toString()}`);
}
