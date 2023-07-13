import querystring from "querystring";
import type { Express, Request } from "express";
import { get, omit, trim, mapKeys, isArray, without, lowerCase, kebabCase, camelCase, startCase } from "lodash";

import { isLocalHost, SERVICE_DOMAIN } from "server/config";
import { listsRouter } from "./router";
import { listsRoutes } from "./routes";
import type { ListsRequestParams } from "./types";
import type { CountryName } from "server/models/types";
import { ServiceType } from "shared/types";
import {
  fcdoFuneralDirectorsByCountry,
  fcdoLawyersPagesByCountry,
  fcdoTranslatorsInterpretersByCountry,
  listOfCountriesWithLegalAid,
} from "server/services/metadata";
import {
  FORM_RUNNER_INITIALISE_SESSION_ROUTE,
  FORM_RUNNER_URL,
  FORM_RUNNER_PUBLIC_URL,
} from "server/components/formRunner/constants";
import { findListsByCountry } from "server/models/list";

export async function initLists(server: Express): Promise<void> {
  server.use(listsRouter);
}

/**
 * TODO: - Refactor so this uses querystring.decode or .encode.
 */
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

/**
 * TODO: - Refactor so this uses querystring.decode or .encode.
 */
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

export function removeQueryParameter(queryString: string, parameterName: string): string {
  const params = omit(querystring.parse(queryString), parameterName);
  return `${querystring.stringify(params)}`;
}

export const getCountryLawyerRedirectLink = (() => {
  const pagesByCountry = mapKeys(fcdoLawyersPagesByCountry, (_, key) => lowerCase(key));

  return (countryName: CountryName): string =>
    get(pagesByCountry, lowerCase(countryName), `/no-list-exists?serviceType=lawyers&country=${countryName}`);
})();

export const getCountryFuneralDirectorsRedirectLink = (() => {
  const pagesByCountry = mapKeys(fcdoFuneralDirectorsByCountry, (_, key) => lowerCase(key));

  return (countryName: CountryName): string =>
    get(pagesByCountry, lowerCase(countryName), `/no-list-exists?serviceType=funeralDirectors&country=${countryName}`);
})();

export const getCountryTranslatorsInterpretersRedirectLink = (() => {
  const pagesByCountry = mapKeys(fcdoTranslatorsInterpretersByCountry, (_, key) => lowerCase(key));

  return (countryName: CountryName): string =>
    get(
      pagesByCountry,
      lowerCase(countryName),
      `/no-list-exists?serviceType=translatorsInterpreters&country=${countryName}`
    );
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

export function formatCountryParam(country: string | string[]): string {
  const countryAsString: string = Array.isArray(country) ? country[0] : country;
  let countryName = countryAsString;

  if (countryName) {
    countryName = startCase(countryAsString);
    if (countryName === "Northern Cyprus") {
      countryName = "northern Cyprus";
    }
    if (countryName === "Cote D Ivoire") {
      countryName = "Côte d'Ivoire";
    }
    const specialChars = [".", ",", "-", "ã", "é", "í", "ç", "ô"];
    specialChars.forEach((specialChar) => {
      countryName = restoreSpecialCharacter(specialChar, countryAsString, countryName);
    });
  }
  return countryName;
}

export async function getLinksOfRelatedLists(
  countryName: CountryName,
  serviceType: ServiceType
): Promise<Array<{ text: string; url: string }>> {
  const relatedLinkOptions = [
    {
      text: `Find a lawyer in ${countryName}`,
      url: `/find/lawyers`,
      type: "lawyers",
    },
    {
      text: `Find a funeral director in ${countryName}`,
      url: `/find/funeral-directors`,
      type: "funeralDirectors",
    },
    {
      text: `Find a translator or interpreter in ${countryName}`,
      url: `/find/translators-interpreters`,
      type: "translatorsInterpreters",
    },
  ];

  const lists = await findListsByCountry(countryName);
  const existingListTypes = lists?.map((list) => list.type) ?? [];

  return relatedLinkOptions
    .filter((link) => serviceType !== link.type)
    .map(({ text, url, type }) => {
      const countryParam = `?country=${countryName}`;
      const relatedListExists = existingListTypes.includes(type);
      return {
        text,
        url: `${url}${relatedListExists ? countryParam : ""}`,
      };
    });
}
