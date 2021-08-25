import querystring from "querystring";
import { Express, Request } from "express";
import { get, omit, trim, mapKeys, isArray, without, lowerCase } from "lodash";

import { isLocalHost, SERVICE_DOMAIN } from "server/config";
import { listsRouter } from "./router";
import { listsRoutes } from "./routes";
import { ListsRequestParams } from "./types";
import { CountryName, ServiceType } from "server/models/types";
import {
  fcdoLawyersPagesByCountry,
  listOfCountriesWithLegalAid,
} from "server/services/metadata";

export async function initLists(server: Express): Promise<void> {
  server.use(listsRouter);
}

export function queryStringFromParams(params: { [name: string]: any }): string {
  return Object.keys(params)
    .map((key) => {
      let value: string = params[key];

      if (isArray(value)) {
        value = value.toString();
      }

      if (value[0] === ",") {
        value = value.substring(1);
      }

      return `${key}=${value}`;
    })
    .join("&");
}

export function parseListValues(
  paramName: string,
  params: ListsRequestParams
): string[] | undefined {
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

export function getServiceLabel(
  serviceType: string | undefined
): string | undefined {
  switch (serviceType) {
    case ServiceType.lawyers:
      return "a lawyer";
    case ServiceType.covidTestProviders:
      return "a COVID-19 test provider";
    default:
      return undefined;
  }
}

export function getAllRequestParams(req: Request): ListsRequestParams {
  return {
    ...req.query,
    ...req.body,
    ...req.params,
  };
}

export function removeQueryParameter(
  queryString: string,
  parameterName: string
): string {
  const params = omit(querystring.parse(queryString), parameterName);
  return `${querystring.stringify(params)}`;
}

export const getCountryLawyerRedirectLink = (() => {
  const pagesByCountry = mapKeys(fcdoLawyersPagesByCountry, (_, key) =>
    lowerCase(key)
  );

  return (countryName: CountryName): string => {
    return get(
      pagesByCountry,
      lowerCase(countryName),
      "https://www.gov.uk/government/collections/list-of-lawyers"
    );
  };
})();

export const countryHasLegalAid = (() => {
  const countriesWithLegalAid = listOfCountriesWithLegalAid.map(lowerCase);
  return (country?: string): boolean =>
    countriesWithLegalAid.includes(lowerCase(country));
})();

export function createConfirmationLink(
  req: Request,
  reference: string
): string {
  const host = `https://${SERVICE_DOMAIN}`;
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
