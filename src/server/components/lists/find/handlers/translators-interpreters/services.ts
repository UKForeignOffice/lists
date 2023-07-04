import type { Request, Response } from "express";
import { sanitiseServices } from "server/components/lists/find/helpers/sanitiseServices";

export function get(req: Request, res: Response) {
  res.render("lists/find/translators-interpreters/services.njk", { values: req.session.answers?.services ?? [] });
}

export function post(req: Request, res: Response) {
  const { services } = req.body;

  const sanitisedServices = sanitiseServices(services);

  if (sanitisedServices.length === 0) {
    req.flash("error", "Select the services you need");
    res.redirect("services");
    return;
  }

  if (req.query.return === "results") {
    res.redirect("result");
    return;
  }

  req.session.answers!.services = sanitisedServices;

  res.redirect(`languages`);
}
