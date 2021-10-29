import { Request, Response } from "express";
import { listItem } from "server/models";
import { DEFAULT_VIEW_PROPS } from "../constants";
import {
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  queryStringFromParams,
} from "../helpers";
import { QuestionName } from "../types";

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
  const params = getAllRequestParams(req);
  const { serviceType, country, region, resultsTurnaround } = params;

  const searchResults = await listItem.findPublishedCovidTestSupplierPerCountry(
    {
      countryName: `${country}`,
      region: `${region}`,
      turnaroundTime: Number(resultsTurnaround),
    }
  );

  res.render("lists/results-page", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    searchResults: searchResults,
    removeQueryParameter,
    queryString: queryStringFromParams(params),
    serviceLabel: getServiceLabel(serviceType),
  });
}
