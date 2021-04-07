import querystring from "querystring";
import { isArray, omit, isString, trim, get, without, startCase } from "lodash";
import { Request } from "express";
import {
  fcdoLawyersPagesByCountry,
  listOfCountriesWithLegalAid,
} from "services/metadata";
import { ListsRequestParams } from "./types";
import { CountryName } from "server/models/types";

export function queryStringFromParams(params: { [name: string]: any }): string {
  return Object.keys(params)
    .map((key) => {
      let value: string = params[key];

      if (isArray(value)) {
        value = value.toString();
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

export function practiceAreaFromParams(
  params: ListsRequestParams
): string[] | undefined {
  if (!("practiceArea" in params)) {
    return undefined;
  }

  const { practiceArea } = params;

  if (isArray(practiceArea)) {
    return without(practiceArea, "");
  }

  if (isString(practiceArea)) {
    return without(practiceArea.split(",").map(trim), "");
  }
}

export function getServiceLabel(
  serviceType: string | undefined
): string | undefined {
  switch (serviceType) {
    case "lawyers":
      return "a lawyer";
    case "medical facilities":
      return "medical assistance";
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

export function getCountryLawyerRedirectLink(countryName: CountryName): string {
  return get(
    fcdoLawyersPagesByCountry,
    startCase(countryName),
    "https://www.gov.uk/government/collections/list-of-lawyers"
  );
}

export function countryHasLegalAid(country: string): boolean {
  return listOfCountriesWithLegalAid.includes(startCase(country));
}
