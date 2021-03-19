import querystring from "querystring";
import _, { isArray, omit } from "lodash";
import { Request, Response } from "express";
import {logger} from "services/logger"
import { countriesList } from "services/medatada";

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
  serviceName: "Service finder",
  countriesList,
  practiceAreasList: [],
};

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

function regionFromParams(params: AllParams): string[] | undefined {
  if (!("region" in params)) {
    return undefined;
  }

  let region = params.region;

  if (typeof region === "string") {
    region = region.split(/,/);
  }

  // TODO: user can click any region

  return region;
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

export function serviceFinderStartPage(req: Request, res: Response): void {
  return res.render("service-finder/start-page", {
    nextRoute: "/service-finder/find",
    previousRoute: "/service-finder/",
  });
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

  const viewProps = {
    ...params,
    ...DEFAULT_VIEW_PROPS,
    responses: { ...req.query },
    serviceLabel: getServiceLabel(serviceType),
    baseRoute: "/base-route",
  };

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
  } else if (req.method === "POST") {
    // all processed, redirect to get route
    logger.warn(req.baseUrl + req.path);
    
    return res.redirect(`/service-finder/results?${queryString}`);
  }

  const searchResults = []; // TODO

  console.log("XXXXX", { params });
  

  return res.render("service-finder/question-page.html", {
    ...viewProps,
    previousRoute: "/service-finder/",
    nextRoute: `/service-finder/find?${queryString}`,
    questionToRender,
    params,
    searchResults,
    removeQueryParameter: (route: string, parameterName: string) => {
      const [path, query] = route.split(/\?/);
      const params = omit(querystring.parse(query), parameterName);
      return `${path}?${querystring.stringify(params)}`;
    },
  });
}
