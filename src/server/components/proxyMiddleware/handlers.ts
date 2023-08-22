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
  const { value } = serviceTypeSchema.validate(req.params);

  req.session.application ??= {};
  res.render(`apply/${value.serviceType}/start`);
}

function getCountrySelectPage(req: Request, res: Response) {
  const { value } = serviceTypeSchema.validate(req.params);

  res.render("apply/which-country-list-do-you-want-to-be-added-to", {
    countriesList,
    answer: req.session.application?.country,
    backLink: `/application/${value.serviceType}/start`,
  });
}

async function postCountrySelectPage(req: Request, res: Response) {
  const { country } = req.body;
  const validatedCountry = validateCountryLower(country);
  const { value } = serviceTypeSchema.validate(req.params);
  const camelCaseServiceType = camelCase(value.serviceType) as "lawyers" | "funeralDirectors";
  const nextPagePath = {
    lawyers: "what-size-is-your-company-or-firm",
    "funeral-directors": "can-you-provide-funeral-services-and-support-to-customers-in-english",
  };

  if (!validatedCountry) {
    req.flash("error", "You must enter a country name");
    res.redirect(`/application/${value.serviceType}/which-country-list-do-you-want-to-be-added-to`);
    return;
  }

  req.session.application = {
    type: value.serviceType as "lawyers" | "funeral-directors",
    country: validatedCountry,
  };

  const list = await listExists(validatedCountry, camelCaseServiceType);

  if (!list) {
    res.redirect("not-currently-accepting");
    return;
  }

  res.redirect(
    `/application/${value.serviceType}/${nextPagePath[value.serviceType as "lawyers" | "funeral-directors"]}`
  );
}

function getStopPage(req: Request, res: Response) {
  const { value } = serviceTypeSchema.validate(req.params);
  const serviceTitles = {
    lawyers: "lawyers",
    "funeral-directors": "funeral directors",
    "translators-interpreters": "translators and interpreters",
  };

  res.render("apply/not-accepting-currently", {
    backLink: `/application/${value.serviceType}/which-country-list-do-you-want-to-be-added-to`,
    country: req.session?.application?.country,
    serviceTitle: serviceTitles[value.serviceType as keyof typeof serviceTitles],
  });
}
