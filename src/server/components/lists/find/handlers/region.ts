import { URLSearchParams } from "url";
import type { Request, Response } from "express";
import { sanitiseRegion } from "server/components/lists/find/helpers/sanitiseRegion";

export function get(req: Request, res: Response) {
  res.render("lists/find/region", {
    answers: req.session.answers,
  });
}

export function post(req: Request, res: Response) {
  const rawRegion = req.body.region || "";
  const region = sanitiseRegion(rawRegion);
  const { serviceType } = req.params;
  const encoded = encodeURIComponent(region);

  const params = new URLSearchParams({
    ...req.query,
    ...(encoded && { region: encoded }),
  });

  const queryString = params.toString();

  req.session.answers = {
    ...req.session.answers,
    region,
  };

  if (req.query.return === "results") {
    res.redirect("result");
    return;
  }

  if (req.session.answers?.disclaimer === true) {
    res.redirect(`result?${queryString}`);
    return;
  }

  if (serviceType === "lawyers") {
    res.redirect(`practice-areas?${queryString}`);
    return;
  }

  if (serviceType === "translators-interpreters") {
    res.redirect(`services?${queryString}`);
    return;
  }

  res.redirect(`disclaimer?${queryString}`);
}
