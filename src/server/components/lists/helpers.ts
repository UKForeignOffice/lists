import querystring from "querystring";
import type { Express, NextFunction, Request, Response } from "express";
import { get, omit, trim, mapKeys, isArray, without, lowerCase, kebabCase, camelCase, startCase } from "lodash";

import { isLocalHost, SERVICE_DOMAIN } from "server/config";
import { listsRouter } from "./router";
import { listsRoutes } from "./routes";
import type { ListsRequestParams } from "./types";
import type { CountryName } from "server/models/types";
import { ServiceType } from "server/models/types";
import {
  fcdoFuneralDirectorsByCountry,
  fcdoLawyersPagesByCountry,
  fcdoTranslatorsInterpretersByCountry,
  listOfCountriesWithLegalAid,
} from "server/services/metadata";
import { URLSearchParams } from "url";
import {
  FORM_RUNNER_INITIALISE_SESSION_ROUTE,
  FORM_RUNNER_URL,
  FORM_RUNNER_PUBLIC_URL,
} from "server/components/formRunner/constants";

export async function initLists(server: Express): Promise<void> {
  server.use(listsRouter);
}

/**
 * To support the select all option for checkbox fields, this function does the following:
 *   - detects if the value "All" is provided and will remove all other options in the event "Select All" and any
 *     additional checkboxes were selected by the user.  Currently this is only required for lawyers.practiceArea
 *     (Areas of law field).
 *   - detects if the region field is empty and sets to the value "Not set" to enable searching for by the entire country.
 *   - detects the presence of the _csrf property and deletes it.
 * @param params
 */
export function preProcessParams(params: Record<string, any>, req: Request): Record<string, any> {
  const { _csrf, ...paramsCopy } = params;

  // select all
  const hasSelectedAll: boolean = paramsCopy?.practiceArea?.includes("All") ?? false;

  // region validation
  const noRegionSelected = paramsCopy?.region === "";

  // country validation
  let { country } = paramsCopy || "";
  if (paramsCopy?.sameCountry?.includes("yes") && country === "United Kingdom") {
    delete paramsCopy.country;
    country = null;
  } else if (paramsCopy?.sameCountry?.includes("no") && country !== "United Kingdom") {
    country = "United Kingdom";
  }

  // translation services validation
  if (paramsCopy.servicesProvided) {
    if (!paramsCopy.servicesProvided.includes("translation")) {
      delete paramsCopy.translationSpecialties;
    }
    if (!paramsCopy.servicesProvided.includes("interpretation")) {
      delete paramsCopy.interpreterServices;
    }
  }

  return {
    ...paramsCopy,
    ...(hasSelectedAll && { practiceArea: "All" }),
    ...(noRegionSelected && { region: "Not set" }),
    ...(country && { country: country }),
  };
}

export function queryStringFromParams(params: Record<string, any>, removeEmptyValues?: boolean): string {
  return Object.keys(params)
    .filter((param) => param !== "page")
    .map((key) => {
      let value: string = params[key];

      if (isArray(value)) {
        value = value.filter(Boolean).toString();
      }

      if (value[0] === ",") {
        value = value.substring(1);
      }

      if (removeEmptyValues === true && value === "") {
        return "";
      }

      return `${key}=${value}`;
    })
    .filter(Boolean)
    .join("&");
}

export function parseListValues(paramName: string, params: ListsRequestParams): string[] | undefined {
  if (!(`${paramName}` in params)) {
    return undefined;
  }

  const value = get(params, paramName);

  if (isArray(value)) {
    return without(value, "", undefined);
  } else {
    return without(value.split(",").map(trim), "");
  }
}

export function getServiceLabel(serviceType: string | undefined): string | undefined {
  switch (getServiceTypeName(serviceType)) {
    case ServiceType.lawyers:
      return "a lawyer";
    case ServiceType.covidTestProviders:
      return "a COVID-19 test provider";
    case ServiceType.funeralDirectors:
      return "a funeral director";
    case ServiceType.translatorsInterpreters:
      return "a translator or interpreter";
    default:
      return undefined;
  }
}

export function getServiceTypeName(serviceType: string | undefined): string | undefined {
  if (!serviceType) {
    return undefined;
  }
  return camelCase(serviceType);
}

export function getAllRequestParams(req: Request): ListsRequestParams {
  return {
    ...req.query,
    ...req.body,
    ...req.params,
  };
}

export function getParameterValue(parameterName: string, queryString: string): string {
  const searchParams = new URLSearchParams(queryString);
  return searchParams.get(parameterName) ?? "";
}

export function removeQueryParameter(queryString: string, parameterName: string): string {
  const params = omit(querystring.parse(queryString), parameterName);
  return `${querystring.stringify(params)}`;
}

export const getCountryLawyerRedirectLink = (() => {
  const pagesByCountry = mapKeys(fcdoLawyersPagesByCountry, (_, key) => lowerCase(key));

  return (countryName: CountryName): string => {
    return get(pagesByCountry, lowerCase(countryName), "https://www.gov.uk/government/collections/list-of-lawyers");
  };
})();

export const getCountryFuneralDirectorsRedirectLink = (() => {
  const pagesByCountry = mapKeys(fcdoFuneralDirectorsByCountry, (_, key) => lowerCase(key));

  return (countryName: CountryName): string => {
    return get(
      pagesByCountry,
      lowerCase(countryName),
      "https://www.gov.uk/government/collections/funeral-directors-worldwide-list"
    );
  };
})();

export const getCountryTranslatorsInterpretersRedirectLink = (() => {
  const pagesByCountry = mapKeys(fcdoTranslatorsInterpretersByCountry, (_, key) => lowerCase(key));

  return (countryName: CountryName): string => {
    return get(
      pagesByCountry,
      lowerCase(countryName),
      "https://www.gov.uk/government/collections/lists-of-translators-and-interpreters"
    );
  };
})();

export const countryHasLegalAid = (() => {
  const countriesWithLegalAid = listOfCountriesWithLegalAid.map(lowerCase);
  return (country?: string): boolean => countriesWithLegalAid.includes(lowerCase(country));
})();

export function createConfirmationLink(req: Request, reference: string): string {
  const protocol = isLocalHost ? "http" : "https";
  const host = `${protocol}://${SERVICE_DOMAIN}`;
  const path = listsRoutes.confirmApplication.replace(":reference", reference);

  return `${host}${path}`;
}

export function createListSearchBaseLink(serviceType: string): string {
  if (serviceType === undefined) {
    throw new Error("createListSearchBaseLink serviceType is undefined");
  }

  const protocol = isLocalHost ? "http" : "https";
  return `${protocol}://${SERVICE_DOMAIN}${listsRoutes.finder}?serviceType=${serviceType}`;
}

export function createFormRunnerReturningUserLink(serviceType: string, isAnnualReview: boolean): string {
  if (serviceType === undefined) {
    throw new Error("createFormRunnerReturningUserLink serviceType is undefined");
  }

  if (serviceType === "covidTestProviders") {
    throw new Error("This service is not supported");
  }

  const formName = kebabCase(serviceType);

  return `${FORM_RUNNER_URL}${FORM_RUNNER_INITIALISE_SESSION_ROUTE}/${formName}`;
}

export function createFormRunnerEditListItemLink(token: string): string {
  if (token === undefined) {
    throw new Error("createFormRunnerEditListItemLink token is undefined");
  }

  const protocol = isLocalHost ? "http" : "https";
  return `${protocol}://${FORM_RUNNER_PUBLIC_URL}${FORM_RUNNER_INITIALISE_SESSION_ROUTE}/${token}`;
}

function restoreSpecialCharacter(specialCharacter: string, country: string, countryName: string): string {
  const index = country.indexOf(specialCharacter);
  if (index > 0) {
    const before = countryName.substring(0, index);
    const after =
      specialCharacter === "," || specialCharacter === "."
        ? countryName.substring(index)
        : countryName.substring(index + 1);
    countryName = before.concat(specialCharacter, after);
  }
  return countryName;
}

export function formatCountryParam(country: string): string {
  let countryName: string = country;

  if (countryName) {
    countryName = startCase(country);
    if (countryName === "Northern Cyprus") {
      countryName = "northern Cyprus";
    }
    if (countryName === "Cote D Ivoire") {
      countryName = "Côte d'Ivoire";
    }
    const specialChars = [".", ",", "-", "ã", "é", "í", "ç", "ô"];
    specialChars.forEach((specialChar) => {
      countryName = restoreSpecialCharacter(specialChar, country, countryName);
    });
  }
  return countryName;
}

function getRestOfQueryParams(req: Request): string {
  const { serviceType, country, ...rest } = req.query;
  return querystring.stringify(rest as NodeJS.Dict<string>);
}

export function redirectToNewUrlStructure(req: Request, res: Response, next: NextFunction) {
  const oldUrlStructure = "/results?serviceType=";
  if (req.originalUrl.includes(oldUrlStructure)) {
    const newUrlStructure = `/results/${req.query.serviceType}/${req.query.country}?${getRestOfQueryParams(req)}`;
    res.redirect(newUrlStructure);
  } else {
    next();
  }
}
