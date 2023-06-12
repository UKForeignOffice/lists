import { NextFunction, Request, Response } from "express";
import { listsRoutes } from "./../routes";
import { setEmailIsVerified } from "server/models/listItem/listItem";
import { DEFAULT_VIEW_PROPS } from "./../constants";
import { CountryName } from "server/models/types";
import { ServiceType } from "shared/types";
import { SERVICE_DOMAIN } from "server/config";
import { kebabCase } from "lodash";
import {
  formatCountryParam,
  getAllRequestParams,
  getCountryFuneralDirectorsRedirectLink,
  getCountryLawyerRedirectLink,
  getCountryTranslatorsInterpretersRedirectLink,
  getParameterValue,
  getServiceLabel,
  getServiceTypeName,
  preProcessParams,
  queryStringFromParams,
  removeQueryParameter,
} from "./../helpers";
import { questions } from "./../questionnaire";
import { logger } from "server/services/logger";
import type { QuestionData, QuestionDataSet, QuestionError, QuestionName } from "./../types";
import { languages, translationInterpretationServices } from "server/services/metadata";
import { lawyersQuestionsSequence, searchLawyers } from "./../searches/lawyers";
import { covidTestProviderQuestionsSequence, searchCovidTestProvider } from "./../searches/covid-test-provider";
import { getCSRFToken } from "server/components/cookies/helpers";
import {
  getLanguageNames,
  getLanguagesRows,
  setLanguagesProvided,
  some,
} from "server/models/listItem/providers/helpers";
import {
  funeralDirectorsQuestionsSequence,
  searchFuneralDirectors,
} from "server/components/lists/searches/funeral-directors";
import {
  searchTranslatorsInterpreters,
  translatorsInterpretersQuestionsSequence,
} from "server/components/lists/searches/translators-interpreters";
import { LanguageRows } from "server/models/listItem/providers/types";
import serviceName from "server/utils/service-name";
import { sendManualActionNotificationToPost } from "server/services/govuk-notify";

export async function listsPostController(req: Request, res: Response, next: NextFunction): Promise<void> {
  let params = getAllRequestParams(req);
  // clean parameters
  params = preProcessParams(params, req);
  const { country, newLanguage } = params;
  const { continueButton } = req.body;
  let languagesProvided = params.languagesProvided ?? "";
  let { serviceType } = params;
  const serviceTypeName = getServiceTypeName(serviceType);

  if (country && serviceType) {
    try {
      serviceType = serviceTypeName as ServiceType;
      params = { ...params, serviceType };
      const countryName: string = formatCountryParam(country);

      const countryHasListItems = await some(countryName as CountryName, serviceType);
      let redirectLink: string | undefined;

      if (!countryHasListItems) {
        switch (serviceType) {
          case ServiceType.lawyers:
            redirectLink = getCountryLawyerRedirectLink(countryName as CountryName);
            break;
          case ServiceType.covidTestProviders:
            redirectLink = `${listsRoutes.privateBeta}?serviceType=${ServiceType.covidTestProviders}`;
            break;
          case ServiceType.funeralDirectors:
            redirectLink = getCountryFuneralDirectorsRedirectLink(countryName as CountryName);
            break;
          case ServiceType.translatorsInterpreters:
            redirectLink = getCountryTranslatorsInterpretersRedirectLink(countryName as CountryName);
            break;
          default:
            redirectLink = undefined;
        }

        if (redirectLink !== undefined) {
          res.redirect(redirectLink);
          return;
        }
      }
    } catch (error) {
      next(error);
      return;
    }
  }

  if (newLanguage) {
    languagesProvided = setLanguagesProvided(newLanguage, languagesProvided as string);
    params.languagesProvided = languagesProvided;
  }

  if (params?.continueButton) {
    delete params.continueButton;
  }

  const queryString = queryStringFromParams(params);
  let url = `${listsRoutes.finder}?${queryString}`;
  const languagesPopulated = !!continueButton;

  if (languagesPopulated && params.languagesProvided) {
    url = url.concat(`&languagesPopulated=true`);
  }

  res.redirect(url);
}

export function listsGetController(req: Request, res: Response): void {
  let params = getAllRequestParams(req);

  if (params.page === undefined || params.page !== "") {
    params.page = "";
  }
  const queryString = queryStringFromParams(params);
  if (params.country) {
    const countryName: string = formatCountryParam(params.country as string);
    params = { ...params, country: countryName as CountryName };
  }

  const { serviceType } = params;
  let { languagesProvided, servicesProvided } = params;
  let partialPageTitle: string = "";
  let partialPageHintText: string = "";
  let partialToRender: string = "";
  let error: boolean | QuestionError = false;
  let backUrl: string = "";
  let languagesRows: LanguageRows = { rows: [] };
  let languageNamesProvided: string | undefined = "";
  let serviceNamesProvided: string[] = [];
  let questionsSequence: QuestionName[];
  let partialData: QuestionDataSet[] | QuestionData[] = [];

  if (languagesProvided) {
    const cleanedLanguagesProvided = getLanguageNames(languagesProvided as string);
    languagesProvided = cleanedLanguagesProvided;
    params.languagesProvided = cleanedLanguagesProvided;
    languagesRows = getLanguagesRows(languagesProvided as string, queryString);
    const paramsCopy = { ...params };
    delete paramsCopy.languagesPopulated;
    backUrl = `${listsRoutes.finder}?${queryStringFromParams(paramsCopy)}`;

    // populate filtered language names
    languageNamesProvided = cleanedLanguagesProvided
      ?.split(",")
      .map((language: string) => {
        // @ts-ignore
        return languages[language];
      })
      .join(", ");
  }

  if (servicesProvided) {
    // @ts-ignore
    serviceNamesProvided = servicesProvided.split(",").map((service) => {
      if (service === "All") return "All";
      return translationInterpretationServices.find((metaDataService) => metaDataService.value === service)?.value;
    });
  }

  if (serviceType === undefined) {
    res.render("lists/question-page", {
      ...DEFAULT_VIEW_PROPS,
      ...params,
      partialToRender: "question-service-type.njk",
      getServiceLabel,
      csrfToken: getCSRFToken(req),
    });
    return;
  }

  switch (getServiceTypeName(serviceType)) {
    case ServiceType.lawyers:
      questionsSequence = lawyersQuestionsSequence;
      break;
    case ServiceType.covidTestProviders:
      questionsSequence = covidTestProviderQuestionsSequence;
      break;
    case ServiceType.funeralDirectors:
      questionsSequence = funeralDirectorsQuestionsSequence;
      break;
    case ServiceType.translatorsInterpreters:
      questionsSequence = translatorsInterpretersQuestionsSequence;
      break;
    default:
      questionsSequence = [];
  }

  const serviceTypeName = getServiceTypeName(serviceType);
  const askQuestion = questionsSequence.some((questionName) => {
    const question = questions[questionName];

    if (question.needsToAnswer(req)) {
      partialToRender = question.getViewPartialName(req);
      partialPageTitle = question.pageTitle(req);
      partialPageHintText = question.pageHintText?.(req) ?? "";
      error = question.validate(req);
      partialData = (question?.getPartialData && question?.getPartialData(req)) ?? [];
      return true;
    }

    return false;
  });

  const serviceDomain = SERVICE_DOMAIN ?? "";

  const serviceApplyUrl = `http${
    serviceDomain.includes("localhost") ? "" : "s"
  }://${serviceDomain}/application/${kebabCase(serviceTypeName)}`;

  if (askQuestion) {
    res.render("lists/question-page", {
      ...DEFAULT_VIEW_PROPS,
      ...params,
      error,
      queryString,
      partialToRender,
      partialPageTitle,
      partialPageHintText,
      languagesProvided,
      languageNamesProvided,
      serviceNamesProvided,
      serviceApplyUrl,
      partialData,
      languagesRows,
      backUrl,
      removeQueryParameter,
      getParameterValue,
      serviceLabel: getServiceLabel(params.serviceType),
      serviceLabelPlural: serviceName(params.serviceType as string),
      csrfToken: getCSRFToken(req),
    });

    return;
  }

  // redirect to results page
  res.redirect(`${listsRoutes.results}?${queryString}`);
}

export function removeLanguageGetController(req: Request, res: Response): void {
  const params = getAllRequestParams(req);
  if (params.page === undefined || params.page !== "") {
    params.page = "";
  }

  let languagesProvided = params.languagesProvided as string;
  const languageToRemove = req.params.language;

  // @ts-ignore
  if (languageToRemove && languagesProvided && languagesProvided.includes(languageToRemove)) {
    // @ts-ignore
    languagesProvided = languagesProvided
      .split(",")
      .filter((language: string) => language !== languageToRemove)
      .join(",");
    params.languagesProvided = languagesProvided;
  }

  const queryString = queryStringFromParams(params);
  res.redirect(`${listsRoutes.finder}?${queryString}`);
}

export function listsResultsController(req: Request, res: Response, next: NextFunction): void {
  const params = getAllRequestParams(req);
  const { serviceType } = params;

  switch (getServiceTypeName(serviceType)) {
    case ServiceType.lawyers:
      searchLawyers(req, res).catch((error) => logger.error("Find a lawyer result controller", { error }));
      break;
    case ServiceType.covidTestProviders:
      searchCovidTestProvider(req, res).catch((error) => {
        logger.error("Find a COVID test provider result controller", { error });
      });
      break;
    case ServiceType.funeralDirectors:
      searchFuneralDirectors(req, res).catch((error) =>
        logger.error("Find a funeral director result controller", { error })
      );
      break;
    case ServiceType.translatorsInterpreters:
      searchTranslatorsInterpreters(req, res).catch((error) => {
        logger.error("Find a translator or interpreter result controller", {
          error,
        });
      });
      break;
    default:
      next();
  }
}

export async function listsConfirmApplicationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { reference } = req.params;

  try {
    const { type, listId } = await setEmailIsVerified({
      reference,
    });

    if (type === undefined) {
      res.sendStatus(404);
    } else {
      let serviceName: string;

      switch (type) {
        case ServiceType.lawyers:
          serviceName = "Find a lawyer abroad";
          break;
        case ServiceType.covidTestProviders:
          serviceName = "Find a COVID-19 test provider abroad";
          break;
        case ServiceType.funeralDirectors:
          serviceName = "Find a funeral director abroad";
          break;
        case ServiceType.translatorsInterpreters:
          serviceName = "Find a translator or interpreter abroad";
          break;
        default:
          serviceName = "Find a professional service abroad";
      }

      await sendManualActionNotificationToPost(listId as number, "PROVIDER_SUBMITTED");

      res.render("lists/application-confirmation-page", {
        serviceName,
      });
    }
  } catch (e) {
    next(e);
  }
}

export function listsGetPrivateBetaPage(req: Request, res: Response, next: NextFunction): void {
  const { serviceType } = req.query;

  if (serviceType === undefined) {
    return next();
  }

  res.render("lists/private-beta-page", {
    serviceType: getServiceTypeName(serviceType as string),
    ServiceType,
  });
}

export function listsGetNonExistent(req: Request, res: Response) {
  const { serviceType, country } = req.query;
  const backLink = `/find?serviceType=${serviceType}&readNotice=ok`;
  const typedServiceType = serviceType as "translatorsInterpreters" | "lawyers" | "funeralDirectors";

  const serviceTypes = {
    translatorsInterpreters: "translators or interpreters",
    lawyers: "lawyers",
    funeralDirectors: "funeral directors",
  };

  res.render("lists/non-existent-list", {
    serviceType: serviceTypes[typedServiceType],
    country,
    backLink,
  });
}
