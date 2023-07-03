import type { Request, Response } from "express";
import { ROWS_PER_PAGE, getPaginationValues } from "server/models/listItem/pagination";
import { getServiceLabel, getAllRequestParams, queryStringFromParams, getLinksOfRelatedLists } from "../helpers";
import { QuestionName } from "../types";
import { TranslatorInterpreterListItem } from "server/models/listItem/providers";
import * as metaData from "server/services/metadata";
import type { TranslatorInterpreterListItemGetObject } from "server/models/types";
import { validateCountry } from "server/models/listItem/providers/helpers";
import { listsRoutes } from "../routes";
import { logger } from "server/services/logger";
import { getRelatedLinks } from "server/components/lists/searches/helpers/getRelatedLinks";
import querystring from "querystring";
import { sanitiseServices } from "server/components/lists/find/helpers/sanitiseServices";
import { sanitiseLanguages } from "server/components/lists/find/helpers/sanitiseLanguages";
import { sanitiseInterpretationTypes } from "server/components/lists/find/helpers/sanitiseInterpretationTypes";
import { sanitiseTranslationTypes } from "server/components/lists/find/helpers/sanitiseTranslationTypes";

export const translatorsInterpretersQuestionsSequence = [
  QuestionName.readNotice,
  QuestionName.country,
  QuestionName.region,
  QuestionName.servicesProvided,
  QuestionName.languagesProvided,
  QuestionName.languagesSummary,
  QuestionName.translationSpecialties,
  QuestionName.interpreterServices,
  QuestionName.interpreterTranslationServices,
  QuestionName.readDisclaimer,
];

const serviceTypeToNoun: Record<string, string> = {
  translation: "translators",
  interpretation: "interpreters",
};

function makeResultsTitle(country: string, servicesProvided: string[]): string {
  const sanitisedServicesProvidedQuery = servicesProvided.map((service) => serviceTypeToNoun[service]).filter(Boolean);
  return `${sanitisedServicesProvidedQuery.join(" and ")} in ${country}`;
}

interface SwornOutputTypes {
  translators: boolean;
  interpreters: boolean;
}
function hasSworn(results: TranslatorInterpreterListItemGetObject[]): SwornOutputTypes {
  return {
    translators: results.some(
      (result) => result.jsonData.swornTranslations === "Yes" || result.jsonData.swornTranslations
    ),
    interpreters: results.some(
      (result) => result.jsonData.swornInterpretations === "Yes" || result.jsonData.swornInterpretations
    ),
  };
}

export async function searchTranslatorsInterpreters(req: Request, res: Response) {
  const params = getAllRequestParams(req);
  const { serviceType, country, region, print = "no" } = params;
  const page = params.page || 1;

  const pageNum = parseInt(page);
  params.page = pageNum.toString();

  if (!country) {
    const query = querystring.encode(req.query as Record<string, string>);
    res.redirect(`${listsRoutes.finder}/country?${query}`);
    return;
  }

  let servicesProvided;
  let allRows: TranslatorInterpreterListItemGetObject[] = [];
  let searchResults: TranslatorInterpreterListItemGetObject[] = [];
  const filterProps: {
    countryName?: string;
    region?: string;
    servicesProvided: string[] | undefined;
    languagesProvided: string[] | undefined;
    interpreterServices: string[] | undefined;
    translationSpecialties: string[] | undefined;
    offset: number;
  } = {
    countryName: validateCountry(country),
    region: decodeURIComponent(region),
    servicesProvided: sanitiseServices(params.services),
    languagesProvided: sanitiseLanguages(params.languages),
    interpreterServices: sanitiseInterpretationTypes(params.interpreterTypes),
    translationSpecialties: sanitiseTranslationTypes(params.translationTypes),
    offset: -1,
  };

  try {
    allRows = await TranslatorInterpreterListItem.findPublishedTranslatorsInterpretersPerCountry(filterProps);
  } catch (e) {
    // continue with empty allRows[]
    logger.error(`Exception searching for translators or interpreters`, e);
  }

  const count = allRows.length;

  const { pagination } = await getPaginationValues({
    count,
    page: pageNum,
    listRequestParams: params,
  });

  const offset = ROWS_PER_PAGE * pagination.results.currentPage - ROWS_PER_PAGE;

  filterProps.offset = offset;

  if (allRows.length > 0) {
    searchResults = await TranslatorInterpreterListItem.findPublishedTranslatorsInterpretersPerCountry(filterProps);
    searchResults = searchResults.map((listItem: TranslatorInterpreterListItemGetObject) => {
      if (listItem.jsonData.languagesProvided) {
        listItem.jsonData.languagesProvided = listItem.jsonData.languagesProvided?.map(
          (language: string) => metaData.languages[language]
        );
      }

      if (listItem.jsonData.deliveryOfServices?.includes("inPerson")) {
        listItem.jsonData = {
          ...listItem.jsonData,
          deliveryOfServices: listItem.jsonData.deliveryOfServices.map((service) =>
            service === "inPerson" ? "In person" : service
          ),
        };
      }

      return listItem;
    });
  }
  const results = print === "yes" ? allRows : searchResults;

  const relatedLinks = [
    ...(await getRelatedLinks(country, serviceType!)),
    ...(await getLinksOfRelatedLists(country, serviceType!)),
  ];

  return {
    resultsTitle: makeResultsTitle(country, servicesProvided ?? []),
    searchResults: results,
    hasSworn: hasSworn(results),
    filterProps,
    queryString: queryStringFromParams(params),
    serviceLabel: getServiceLabel(serviceType),
    limit: ROWS_PER_PAGE,
    offset,
    pagination,
    print,
    relatedLinks,
  };
}
