import type { Request, Response } from "express";
import { validateCountryLower } from "server/models/listItem/providers/helpers";
import { listExists, serviceTypeSchema } from "server/components/proxyMiddleware/helpers";
import { countriesList } from "server/services/metadata";
import { camelCase } from "lodash";

export const handlers = {
  start: {
    get: getStartPage,
  },
  countrySelect: {
    get: getCountrySelectPage,
    post: postCountrySelectPage,
  },
  stop: {
    get: getStopPage,
  },
};

function getStartPage(req: Request, res: Response) {
  const { value: serviceType } = serviceTypeSchema.validate(req.params.serviceType);

  req.session.application ??= {};
  res.render(`apply/${serviceType}/start`);
}

function getCountrySelectPage(req: Request, res: Response) {
  const { value: serviceType } = serviceTypeSchema.validate(req.params.serviceType);

  res.render("apply/which-country-list-do-you-want-to-be-added-to", {
    countriesList,
    answer: req.session.application?.country,
    backLink: `/application/${serviceType}/start`,
  });
}

async function postCountrySelectPage(req: Request, res: Response) {
  const { country } = req.body;
  const validatedCountry = validateCountryLower(country);
  const { value: serviceType } = serviceTypeSchema.validate(req.params.serviceType);
  const camelCaseServiceType = camelCase(serviceType) as "lawyers" | "funeralDirectors";
  const nextPagePath = {
    lawyers: "what-size-is-your-company-or-firm",
    "funeral-directors": "can-you-provide-funeral-services-and-support-to-customers-in-english",
  };

  if (!validatedCountry) {
    req.flash("error", "You must enter a country name");
    res.redirect(`/application/${serviceType}/which-country-list-do-you-want-to-be-added-to`);
    return;
  }

  req.session.application = {
    type: serviceType,
    country: validatedCountry,
  };

  const list = await listExists(validatedCountry, camelCaseServiceType);

  if (!list) {
    res.redirect("not-currently-accepting");
    return;
  }

  res.redirect(`/application/${serviceType}/${nextPagePath[serviceType!]}`);
}

function getStopPage(req: Request, res: Response) {
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
