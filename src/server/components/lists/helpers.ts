import querystring from "querystring";
import { Express, Request } from "express";
import { get, omit, trim, mapKeys, isArray, without, lowerCase, kebabCase, camelCase } from "lodash";

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
import {
  FORM_RUNNER_INITIALISE_SESSION_ROUTE,
  FORM_RUNNER_URL,
  FORM_RUNNER_PUBLIC_URL
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
export function preProcessParams(params: { [name: string]: any }): {
  [name: string]: any;
} {
  const { _csrf, ...paramsCopy } = params;
  const hasSelectedAll: boolean =
    paramsCopy?.practiceArea?.includes("All") ?? false;
  const noRegionSelected = paramsCopy?.region === "";
  let { country } = paramsCopy || "";
  if (paramsCopy?.sameCountry?.includes("yes") && country === "United Kingdom") {
    delete paramsCopy.country;
    country = null;
  } else if (paramsCopy?.sameCountry?.includes("no") && country !== "United Kingdom") {
    country = "United Kingdom";
  }

  return {
    ...paramsCopy,
    ...(hasSelectedAll && { practiceArea: "All" }),
    ...(noRegionSelected && { region: "Not set" }),
    ...(country && { country: country }),
  };
}

export function queryStringFromParams(
  params: { [name: string]: any },
  removeEmptyValues?: boolean
): string {
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
  switch (getServiceTypeName(serviceType)) {
    case ServiceType.lawyers:
      return "a lawyer";
    case ServiceType.covidTestProviders:
      return "a COVID-19 test provider";
    case ServiceType.funeralDirectors:
      return "a funeral director";
    default:
      return undefined;
  }
}

export function getServiceTypeName(
  serviceType: string | undefined
): string | undefined {
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

export function createFormRunnerReturningUserLink(serviceType: string): string {
  if (serviceType === undefined) {
    throw new Error(
      "createFormRunnerReturningUserLink serviceType is undefined"
    );
  }

  return `${FORM_RUNNER_URL}${FORM_RUNNER_INITIALISE_SESSION_ROUTE}/${kebabCase(serviceType)}`;
}

export function createFormRunnerEditListItemLink(token: string): string {
  if (token === undefined) {
    throw new Error("createFormRunnerEditListItemLink token is undefined");
  }

  const protocol = isLocalHost ? "http" : "https";
  return `${protocol}://${FORM_RUNNER_PUBLIC_URL}${FORM_RUNNER_INITIALISE_SESSION_ROUTE}/${token}`;
}
