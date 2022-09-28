import { Request, Response } from "express";
import { ROWS_PER_PAGE, getPaginationValues } from "server/models/listItem/pagination";
import { DEFAULT_VIEW_PROPS } from "../constants";
import {
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  getParameterValue,
  queryStringFromParams, parseListValues
} from "../helpers";
import { QuestionName } from "../types";
import { getCSRFToken } from "server/components/cookies/helpers";
import { TranslatorInterpreterListItem } from "server/models/listItem/providers";
import { languages, translationInterpretationServices } from "server/services/metadata";
import { TranslatorInterpreterListItemGetObject } from "server/models/types";
import { cleanLanguagesProvided } from "server/models/listItem/providers/helpers";
import { camelCase } from "lodash";
import { listsRoutes } from "../routes";
import { logger } from "server/services/logger";

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

const serviceTypeToNoun: { [key: string]: string } = {
  translation: "translator",
  interpretation: "interpreter",
};

function makeResultsTitle(country: string, servicesProvided: string[]): string {
  const sanitisedServicesProvidedQuery = servicesProvided.map((service) => serviceTypeToNoun[service]).filter(Boolean);
  const interpretationOnly = sanitisedServicesProvidedQuery.includes(serviceTypeToNoun.interpretation) && sanitisedServicesProvidedQuery.length === 1;
  const article = interpretationOnly ? "an" : "a";
  return `Find ${article} ${sanitisedServicesProvidedQuery.join(" or ")} in ${country}`;
}

export async function searchTranslatorsInterpreters(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const params = getAllRequestParams(req);
    const { serviceType, country, region, print = "no", languagesProvided } = params;

    if (!country) {
      const query = new URLSearchParams(req.query as Record<string, string>);
      return res.redirect(`${listsRoutes.finder}?${query.toString()}`);
    }

    let languageNamesProvided, serviceNamesProvided;
    let servicesProvided = parseListValues("servicesProvided", params);
    if (servicesProvided != null) {
      servicesProvided = servicesProvided.map((service) => service.toLowerCase());
    }
    let translationSpecialties = parseListValues("translationSpecialties", params);
    if (translationSpecialties != null) {
      translationSpecialties = translationSpecialties.map((service) => service.toLowerCase());
    }
    let interpreterServices = parseListValues("interpreterServices", params);
    if (interpreterServices != null) {
      interpreterServices = interpreterServices.map((service) => service.toLowerCase());
    }

    let { page = "1" } = params;
    page = page !== "" ? page : "1";

    const pageNum = parseInt(page);
    params.page = pageNum.toString();

    if (languagesProvided) {
      const cleanedLanguagesProvided = cleanLanguagesProvided(languagesProvided as string);
      params.languagesProvided = cleanedLanguagesProvided ?? undefined;

      // populate filtered language names
      languageNamesProvided = cleanedLanguagesProvided?.split(",").map((language: string) => {
        // @ts-ignore
        return languages[language];
      }).join(", ");
    }

    if (servicesProvided) {
      serviceNamesProvided = servicesProvided.map((service) => {
        if (service.includes("all")) {
          return camelCase(service);
        }
        const serviceName = translationInterpretationServices.find(
          (metaDataService) => metaDataService.value.toLowerCase() === service
        )?.value;
        return camelCase(serviceName);
      });
    }

    const filterProps = {
      countryName: country,
      region,
      servicesProvided,
      languagesProvided,
      interpreterServices,
      translationSpecialties,
      offset: -1,
    };

    const allRows = await TranslatorInterpreterListItem.findPublishedTranslatorsInterpretersPerCountry(filterProps);
    const count = allRows.length;

    const { pagination } = await getPaginationValues({
      count,
      page: pageNum,
      listRequestParams: params,
    });

    const offset = ROWS_PER_PAGE * pagination.results.currentPage - ROWS_PER_PAGE;

    filterProps.offset = offset;

    let searchResults = await TranslatorInterpreterListItem.findPublishedTranslatorsInterpretersPerCountry(filterProps);
    searchResults = searchResults.map((listItem: TranslatorInterpreterListItemGetObject) => {
      if (listItem.jsonData.languagesProvided) {
        listItem.jsonData.languagesProvided = listItem.jsonData.languagesProvided?.map((language: string) => {
          // @ts-ignore
          return languages[language];
        });
      }
      return listItem;
    });

    const results = print === "yes" ? allRows : searchResults;

    res.render("lists/results-page", {
      ...DEFAULT_VIEW_PROPS,
      ...params,
      resultsTitle: makeResultsTitle(country, servicesProvided ?? []),
      searchResults: results,
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
    });
  } catch (error) {
    logger.error(`searchTranslatorsInterpreters Error: ${(error as Error).message}`);
  }
}
