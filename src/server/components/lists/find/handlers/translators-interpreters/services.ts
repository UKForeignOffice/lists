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

  req.session.answers!.services = sanitisedServices;

  const requiresTranslation = sanitisedServices.includes("translation");
  const requiresInterpretation = sanitisedServices.includes("interpretation");

  if (!requiresTranslation) {
    delete req.session.answers?.translationTypes;
  }

  if (!requiresInterpretation) {
    delete req.session.answers?.interpretationTypes;
  }

  const { interpretationTypes = [], translationTypes = [] } = req.session.answers ?? {};

  let shouldRedirectToTypes = false;

  if (requiresTranslation && translationTypes.length === 0) {
    shouldRedirectToTypes = true;
  }

  if (requiresInterpretation && interpretationTypes.length === 0) {
    shouldRedirectToTypes = true;
  }

  if (req.query.return === "results") {
    if (shouldRedirectToTypes) {
      res.redirect("types?return=results");
      return;
    }

    res.redirect("result");
    return;
  }

  res.redirect(`languages`);
}
