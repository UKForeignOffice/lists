import { Request, Response } from "express";
import { listItem } from "server/models";
import { DEFAULT_VIEW_PROPS } from "./constants";
import {
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  queryStringFromParams,
} from "./helpers";
import { QuestionName } from "./types";

export const covidTestQuestionsSequence = [
  QuestionName.readNotice,
  QuestionName.country,
  QuestionName.region,
  QuestionName.resultsTurnaround,
  QuestionName.readDisclaimer,
];

export async function searchCovidTestSupplier(
  req: Request,
  res: Response
): Promise<void> {
  const params = getAllRequestParams(req);
  const { serviceType, country, region } = params;

  const searchResults = await listItem.findPublishedCovidTestSupplierPerCountry(
    {
      countryName: `${country}`,
      region: `${region}`,
    }
  );

  res.render("lists/results-page.html", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    searchResults: searchResults,
    removeQueryParameter,
    queryString: queryStringFromParams(params),
    serviceLabel: getServiceLabel(serviceType),
  });
}
