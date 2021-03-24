import querystring from "querystring";
import _, { isArray, omit, upperFirst } from "lodash";
import { Request, Response } from "express";
import {} from "services/location";
import {
  countriesList,
  legalPracticeAreasList,
  fcdoLawyersPagesByCountry,
} from "services/metadata";
// import { prisma } from "server/models/prisma-client";
// import { countryHasLawyers } from "server/models/helpers";

interface AllParams {
  serviceType?: string;
  country?: string;
  region?: string | string[];
  practiceArea?: string | string[];
  legalAid?: string;
  readNotice?: string;
}

const DEFAULT_VIEW_PROPS = {
  _,
  countriesList,
  serviceName: "Service finder",
  legalPracticeAreasList,
  questionsRoute: "/service-finder/find",
};

// Helpers

function queryStringFromParams(params: AllParams): string {
  return Object.keys(params)
    .map((key) => {
      let value = params[key];

      if (isArray(value)) {
        value = value.toString();
      }

      return `${key}=${value}`;
    })
    .join("&");
}

function regionFromParams(params: AllParams): string | undefined {
  if (!("region" in params)) {
    return undefined;
  }

  let region = params.region ?? [];

  if (typeof region === "string") {
    region = region.split(/,/);
  }

  if (region[0] === "unsure" && region[1] !== undefined) {
    // user is just posting region form, which includes hidden input with value unknown
    return region[1];
  }

  if (region[0] === "unsure" && region[1] === undefined) {
    // user posted empty region
    return "unsure";
  }

  if (region[0] !== "unsure") {
    // region has already been defined
    return region[0];
  }
}

function practiceAreaFromParams(params: AllParams): string[] | undefined {
  if (!("practiceArea" in params)) {
    return undefined;
  }

  const { practiceArea } = params;

  // TODO
  // user can select any

  if (isArray(practiceArea)) {
    return practiceArea;
  }

  return [practiceArea];
}

function getServiceLabel(serviceType: string | undefined): string {
  return serviceType === "lawyers" ? "a lawyer" : "medical assistance";
}

function getAllRequestParams(req: Request): AllParams {
  return {
    ...req.query,
    ...req.body,
    ...req.params,
  };
}

function removeQueryParameter(
  queryString: string,
  parameterName: string
): string {
  const params = omit(querystring.parse(queryString), parameterName);
  return `${querystring.stringify(params)}`;
}

function getCountryLawyerRedirectLink(countryName: string): string | undefined {
  return fcdoLawyersPagesByCountry[upperFirst(countryName)];
}

async function queryLawyers(params: AllParams): Promise<any[]> {
  return [];
  // const results = await prisma.lawyer.findMany({
  //   where: {
  //     address: {
  //       country: {
  //         name: {
  //           startsWith: params.country,
  //           mode: "insensitive",
  //         },
  //       },
  //     },
  //   },
  //   select: {
  //     contactName: true,
  //     lawFirmName: true,
  //     telephone: true,
  //     email: true,
  //     website: true,
  //     regionsServed: true,
  //     legalPracticeAreas: true,
  //     address: {
  //       select: {
  //         firsLine: true,
  //         postCode: true,
  //         country: {
  //           select: {
  //             name: true,
  //           },
  //         },
  //       },
  //     },
  //   },
  // });

  // return results.map((lawyer) => {
  //   return {
  //     ...lawyer,
  //     legalPracticeAreas: lawyer.legalPracticeAreas
  //       .map((a) => a.name)
  //       .join(", "),
  //   };
  // });
}

// Controllers

export function serviceFinderStartPage(req: Request, res: Response): void {
  return res.render("service-finder/start-page", {
    nextRoute: "/service-finder/find",
    previousRoute: "/service-finder/",
  });
}

export function serviceFinderPostController(req: Request, res: Response): void {
  const params = getAllRequestParams(req);
  const queryString = queryStringFromParams(params);
  const { country } = params;

  if (country !== undefined && !countryHasLawyers(country)) {
    // data hasn't been migrated, redirect user to legacy FCDO pages
    const pageUrl = getCountryLawyerRedirectLink(country);
    if (pageUrl !== undefined) {
      return res.redirect(pageUrl);
    }
  }

  res.redirect(`${DEFAULT_VIEW_PROPS.questionsRoute}?${queryString}`);
}

export function serviceFinderController(req: Request, res: Response): void {
  const params = getAllRequestParams(req);

  const { serviceType, country, legalAid, readNotice } = params;

  const region = regionFromParams(params);
  const practiceArea = practiceAreaFromParams(params);

  if (region !== undefined) {
    params.region = region;
  }

  if (practiceArea !== undefined) {
    params.practiceArea = practiceArea;
  }

  const queryString = queryStringFromParams(params);
  const isSearchingForLawyers = serviceType === "lawyers";

  let questionToRender;

  if (serviceType === undefined) {
    questionToRender = "question-service-type.html";
  } else if (readNotice === undefined) {
    questionToRender = isSearchingForLawyers
      ? "notice-lawyer.html"
      : "notice-medical-facilities.html";
  } else if (country === undefined) {
    questionToRender = "question-country.html";
  } else if (region === undefined) {
    questionToRender = "question-region.html";
  } else if (practiceArea === undefined && isSearchingForLawyers) {
    questionToRender = "question-practice-area.html";
  } else if (legalAid === undefined && isSearchingForLawyers) {
    questionToRender = "question-legal-aid.html";
  } else {
    // all processed, redirect to result route
    res.redirect(`/service-finder/results?${queryString}`);
    return;
  }

  res.render("service-finder/question-page.html", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    queryString,
    questionToRender,
    removeQueryParameter,
    serviceLabel: getServiceLabel(serviceType),
  });
}

export async function serviceFinderResultsController(
  req: Request,
  res: Response
): Promise<void> {
  const params = getAllRequestParams(req);
  const queryString = queryStringFromParams(params);
  const { serviceType } = params;

  let searchResults;

  switch (serviceType) {
    case "lawyers":
      searchResults = await queryLawyers(params);
      break;
    default:
      searchResults = [];
  }

  res.render("service-finder/results-page.html", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    queryString,
    searchResults: searchResults,
    removeQueryParameter,
    serviceLabel: getServiceLabel(serviceType),
  });
}
