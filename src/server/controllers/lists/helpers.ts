import querystring from "querystring";
import { Request } from "express";
import {
  get,
  omit,
  trim,
  mapKeys,
  isArray,
  without,
  isString,
  lowerCase,
} from "lodash";

import { listsRoutes } from "./constants";
import { ListsRequestParams, ServiceType } from "./types";
import { CountryName } from "server/models/types";
import {
  fcdoLawyersPagesByCountry,
  listOfCountriesWithLegalAid,
} from "server/services/metadata";

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

export function regionFromParams(
  params: ListsRequestParams
): string | undefined {
  // TODO: this can be simplified if regions is required but allow user to select unsure
  if (!("region" in params)) {
    return undefined;
  }

  let regions: string[] = [];

  if (typeof params.region === "string") {
    regions = params.region.split(/,/);
  }

  if (regions[0] === "unsure" && regions[1] !== undefined) {
    // user is just posting region form, which includes hidden input with value unknown
    return regions[1];
  }

  if (regions[0] === "unsure" && regions[1] === undefined) {
    // user posted empty region
    return "unsure";
  }

  if (regions[0] !== "unsure") {
    // region has already been defined
    return regions[0];
  }
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
    return without(value, "");
  }

  if (isString(value)) {
    return without(value.split(",").map(trim), "");
  }
}

export function getServiceLabel(
  serviceType: string | undefined
): string | undefined {
  switch (serviceType) {
    case ServiceType.lawyers:
      return "a lawyer";
    case ServiceType.covidTestSupplier:
      return "a Covid test supplier";
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
  const host = `${req.protocol}://${req.get("host")}`;
  const path = listsRoutes.confirmApplication.replace(":reference", reference);

  return `${host}${path}`;
}
