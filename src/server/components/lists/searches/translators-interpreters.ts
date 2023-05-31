import type { Request, Response } from "express";
import { ROWS_PER_PAGE, getPaginationValues } from "server/models/listItem/pagination";
import { DEFAULT_VIEW_PROPS } from "../constants";
import {
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  getParameterValue,
  queryStringFromParams,
  parseListValues,
  getLinksOfOtherServices,
} from "../helpers";
import { QuestionName } from "../types";
import { getCSRFToken } from "server/components/cookies/helpers";
import { TranslatorInterpreterListItem } from "server/models/listItem/providers";
import * as metaData from "server/services/metadata";
import type { TranslatorInterpreterListItemGetObject } from "server/models/types";
import {
  getLanguageNames,
  cleanTranslatorInterpreterServices,
  cleanTranslatorSpecialties,
  cleanInterpreterServices,
  cleanLanguagesProvided,
  validateCountry,
} from "server/models/listItem/providers/helpers";
import { camelCase } from "lodash";
import { listsRoutes } from "../routes";
import { logger } from "server/services/logger";
import type { countriesList } from "server/services/metadata";

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

export async function searchTranslatorsInterpreters(req: Request, res: Response): Promise<void> {
  const params = getAllRequestParams(req);
  const { serviceType, country, region, print = "no" } = params;
  let { page = "1" } = params;
  page = page !== "" ? page : "1";

  const pageNum = parseInt(page);
  params.page = pageNum.toString();

  if (!country) {
    const query = new URLSearchParams(req.query as Record<string, string>);
    res.redirect(`${listsRoutes.finder}?${query.toString()}`);
    return;
  }

  let languageNamesProvided;
  let serviceNamesProvided;
  let servicesProvided;
  let allRows: TranslatorInterpreterListItemGetObject[] = [];
  let searchResults: TranslatorInterpreterListItemGetObject[] = [];
  let filterProps: {
    countryName: typeof countriesList[number]["value"] | undefined;
    region?: string;
    servicesProvided: string[] | undefined;
    languagesProvided: string[] | undefined;
    interpreterServices: string[] | undefined;
    translationSpecialties: string[] | undefined;
    offset: number;
  } = {
    countryName: undefined,
    region: "",
    servicesProvided: [],
    languagesProvided: [],
    interpreterServices: [],
    translationSpecialties: [],
    offset: -1,
  };

  try {
    const countryName = validateCountry(country);

    servicesProvided = parseListValues("servicesProvided", params);
    if (servicesProvided != null) {
      servicesProvided = cleanTranslatorInterpreterServices(servicesProvided);
    }

    let translationSpecialties = parseListValues("translationSpecialties", params);
    if (translationSpecialties != null) {
      translationSpecialties = cleanTranslatorSpecialties(translationSpecialties);
    }

    let interpreterServices = parseListValues("interpreterServices", params);
    if (interpreterServices != null) {
      interpreterServices = cleanInterpreterServices(interpreterServices);
    }

    let languagesProvidedArray = parseListValues("languagesProvided", params);
    if (languagesProvidedArray != null) {
      languagesProvidedArray = cleanLanguagesProvided(languagesProvidedArray);
    }

    if (languagesProvidedArray) {
      const cleanedLanguagesProvided = getLanguageNames(languagesProvidedArray.join(","));
      params.languagesProvided = cleanedLanguagesProvided ?? undefined;

      // populate filtered language names
      languageNamesProvided = cleanedLanguagesProvided
        ?.split(",")
        .map((language: string) => {
          return metaData.languages[language];
        })
        .join(", ");
    }

    if (servicesProvided) {
      serviceNamesProvided = servicesProvided.map((service) => {
        if (service.includes("all")) {
          return camelCase(service);
        }
        const serviceName = metaData.translationInterpretationServices.find(
          (metaDataService) => metaDataService.value.toLowerCase() === service
        )?.value;
        return camelCase(serviceName);
      });
    }

    filterProps = {
      countryName: country,
      region,
      servicesProvided,
      languagesProvided: languagesProvidedArray,
      interpreterServices,
      translationSpecialties,
      offset: -1,
    };

    if (countryName) {
      allRows = await TranslatorInterpreterListItem.findPublishedTranslatorsInterpretersPerCountry(filterProps);
    }
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
  const relatedLinks = await getLinksOfOtherServices(country, serviceType!);

  res.render("lists/results-page", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    resultsTitle: makeResultsTitle(country, servicesProvided ?? []),
    searchResults: results,
    hasSworn: hasSworn(results),
    filterProps,
    removeQueryParameter,
    getParameterValue,
    languageNamesProvided,
    serviceNamesProvided,
    queryString: queryStringFromParams(params),
    serviceLabel: getServiceLabel(serviceType),
    limit: ROWS_PER_PAGE,
    offset,
    pagination,
    print,
    csrfToken: getCSRFToken(req),
    relatedLinks,
  });
}
