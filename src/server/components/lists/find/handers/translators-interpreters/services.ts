import type { Request, Response } from "express";
import { sanitiseServices } from "server/components/lists/find/helpers/sanitiseServices";
import { URLSearchParams } from "url";

export function get(req: Request, res: Response) {
  res.render("lists/find/translators-interpreters/services.njk");
}

export function post(req: Request, res: Response) {
  const { services } = req.body;

  const sanitisedServices = sanitiseServices(services);

  if (sanitisedServices.length === 0) {
    req.flash("error", "Select the services you need");
    res.redirect("services");
    return;
  }

  const params = new URLSearchParams({
    ...req.query,
    services: sanitisedServices,
  });

  res.redirect(`languages?${params.toString()}`);
}
