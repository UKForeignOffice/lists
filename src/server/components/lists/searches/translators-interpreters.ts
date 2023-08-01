import type { Request } from "express";
import { getPaginationValues, ROWS_PER_PAGE } from "server/models/listItem/pagination";
import { getLinksOfRelatedLists, getServiceLabel } from "../helpers";
import { TranslatorInterpreterListItem } from "server/models/listItem/providers";
import * as metaData from "server/services/metadata";
import type { CountryName, TranslatorInterpreterListItemGetObject } from "server/models/types";
import { validateCountryLower } from "server/models/listItem/providers/helpers";
import { logger } from "server/services/logger";
import { getRelatedLinks } from "server/components/lists/searches/helpers/getRelatedLinks";
import { sanitiseServices } from "server/components/lists/find/helpers/sanitiseServices";
import { sanitiseLanguages } from "server/components/lists/find/helpers/sanitiseLanguages";
import { sanitiseInterpretationTypes } from "server/components/lists/find/helpers/sanitiseInterpretationTypes";
import { sanitiseTranslationTypes } from "server/components/lists/find/helpers/sanitiseTranslationTypes";
import { ServiceType } from "shared/types";

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

export async function searchTranslatorsInterpreters(req: Request) {
  const { answers = {} } = req.session;
  const { country, serviceType } = answers;
  const { print = "no", page = 1 } = req.query;
  const pageNum = parseInt(page as string);

  let allRows: TranslatorInterpreterListItemGetObject[] = [];
  let searchResults: TranslatorInterpreterListItemGetObject[] = [];
  const filterProps = {
    countryName: validateCountryLower(country),
    region: decodeURIComponent(answers.region ?? ""),
    servicesProvided: sanitiseServices(answers.services),
    languagesProvided: sanitiseLanguages(answers.languages),
    interpreterServices: sanitiseInterpretationTypes(answers.interpretationTypes ?? []),
    translationSpecialties: sanitiseTranslationTypes(answers.translationTypes ?? []),
    offset: -1,
  };

  try {
    allRows = await TranslatorInterpreterListItem.findPublishedTranslatorsInterpretersPerCountry(filterProps);
  } catch (e) {
    // continue with empty allRows[]
    logger.error("Exception searching for translators or interpreters", e);
  }

  const count = allRows.length;
  const { pagination } = await getPaginationValues({
    count,
    page: pageNum,
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
    ...(await getRelatedLinks(country!, ServiceType.translatorsInterpreters)),
    ...(await getLinksOfRelatedLists(country as CountryName, ServiceType.translatorsInterpreters)),
  ];

  return {
    resultsTitle: makeResultsTitle(country!, filterProps.servicesProvided),
    searchResults: results,
    hasSworn: hasSworn(results),
    filterProps,
    serviceLabel: getServiceLabel(serviceType),
    limit: ROWS_PER_PAGE,
    offset,
    pagination,
    print,
    relatedLinks,
  };
}
