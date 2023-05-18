import { Request, Response } from "express";
import { DEFAULT_VIEW_PROPS } from "../constants";
import {
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  getParameterValue,
  queryStringFromParams,
  formatCountryParam,
} from "../helpers";
import { QuestionName } from "../types";
import { getCSRFToken } from "server/components/cookies/helpers";
import { CovidTestSupplierListItem } from "server/models/listItem/providers";
import { CountryName } from "server/models/types";

export const covidTestProviderQuestionsSequence = [
  QuestionName.readNotice,
  QuestionName.country,
  QuestionName.region,
  QuestionName.resultsTurnaround,
  QuestionName.readCovidDisclaimer,
];

export async function searchCovidTestProvider(
  req: Request,
  res: Response
): Promise<void> {
  let params = getAllRequestParams(req);
  const { serviceType, country, region, resultsTurnaround } = params;
  const countryName = formatCountryParam(country as string);
  params = { ...params, country: countryName as CountryName };
  const searchResults =
    await CovidTestSupplierListItem.findPublishedCovidTestSupplierPerCountry({
      countryName,
      region: `${region}`,
      turnaroundTime: Number(resultsTurnaround),
    });

  res.render("lists/results-page", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    searchResults: searchResults,
    removeQueryParameter,
    getParameterValue,
    queryString: queryStringFromParams(params),
    serviceLabel: getServiceLabel(serviceType),
    csrfToken: getCSRFToken(req),
  });
}