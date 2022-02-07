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
import { URLSearchParams } from "url";

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
export function preProcessParams(params: { [name: string]: any }): {
  [name: string]: any;
} {
  let paramsCopy = { ...params };
  const hasSelectedAll = paramsCopy?.practiceArea?.includes("All") ?? false;
  paramsCopy = hasSelectedAll === true ? { ...paramsCopy, practiceArea: "All" } : params;
  paramsCopy = paramsCopy?.region === "" ? { ...paramsCopy, region: "Not set"} : paramsCopy;
  if (paramsCopy._csrf !== undefined) {
    delete paramsCopy._csrf;
  }

  return paramsCopy;
}

export function queryStringFromParams(
  params: { [name: string]: any },
  removeEmptyValues?: boolean
): string {
  return Object.keys(params)
    .map((key) => {
      let value: string = params[key];

      if (isArray(value)) {
        value = value.toString();
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

export function getParameterValue(
  parameterName: string,
  queryString: string
): string {
  const searchParams = new URLSearchParams(queryString);
  return searchParams.get(parameterName) ?? "";
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
