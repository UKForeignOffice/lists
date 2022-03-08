import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import { listsRoutes } from "./../routes";
import { listItem } from "server/models";
import { DEFAULT_VIEW_PROPS } from "./../constants";
import { ServiceType } from "server/models/types";
import {
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  getParameterValue,
  queryStringFromParams,
  preProcessParams,
  getCountryLawyerRedirectLink,
} from "./../helpers";
import { questions } from "./../questionnaire";
import { logger } from "server/services/logger";
import { QuestionError, QuestionName } from "./../types";
import { legalPracticeAreasList } from "server/services/metadata";
import { searchLawyers, lawyersQuestionsSequence } from "./../searches/lawyers";
import {
  searchCovidTestProvider,
  covidTestProviderQuestionsSequence,
} from "./../searches/covid-test-provider";
import { getCSRFToken } from "server/components/cookies/helpers";

export async function listsPostController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let params = getAllRequestParams(req);

  // clean parameters
  params = preProcessParams(params);
  const queryString = queryStringFromParams(params);

  const { country, serviceType } = params;

  if (country !== undefined && country !== "" && serviceType !== undefined) {
    try {
      const hasItems = await listItem.some(country, serviceType);
      let redirectLink: string | undefined;

      if (!hasItems) {
        switch (serviceType) {
          case ServiceType.lawyers:
            redirectLink = getCountryLawyerRedirectLink(country);
            break;
          case ServiceType.covidTestProviders:
            redirectLink = `${listsRoutes.privateBeta}?serviceType=${ServiceType.covidTestProviders}`;
            break;
          default:
            redirectLink = undefined;
        }

        if (redirectLink !== undefined) {
          return res.redirect(redirectLink);
        }
      }
    } catch (error) {
      return next(error);
    }
  }

  res.redirect(`${listsRoutes.finder}?${queryString}`);
}

export function listsGetController(req: Request, res: Response): void {
  const params = getAllRequestParams(req);
  if (params.page === undefined || params.page !== "") {
    params.page = "";
  }
  const queryString = queryStringFromParams(params);
  const { serviceType } = params;

  let questionsSequence: QuestionName[];
  let partialPageTitle: string = "";
  let partialToRender: string = "";
  let error: boolean | QuestionError = false;

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

  switch (serviceType) {
    case ServiceType.lawyers:
      questionsSequence = lawyersQuestionsSequence;
      break;
    case ServiceType.covidTestProviders:
      questionsSequence = covidTestProviderQuestionsSequence;
      break;
    default:
      questionsSequence = [];
  }

  const askQuestion = questionsSequence.some((questionName) => {
    const question = questions[questionName];

    if (question.needsToAnswer(req)) {
      partialToRender = question.getViewPartialName(req);
      partialPageTitle = question.pageTitle(req);
      error = question.validate(req);
      return true;
    }

    return false;
  });

  if (askQuestion) {
    res.render("lists/question-page", {
      ...DEFAULT_VIEW_PROPS,
      ...params,
      error,
      queryString,
      partialToRender,
      partialPageTitle,
      removeQueryParameter,
      getParameterValue,
      legalPracticeAreasList,
      serviceLabel: getServiceLabel(params.serviceType),
      csrfToken: getCSRFToken(req),
    });

    return;
  }

  // redirect to results page
  res.redirect(`${listsRoutes.results}?${queryString}`);
}

export function listsResultsController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const params = getAllRequestParams(req);
  const { serviceType } = params;

  switch (serviceType) {
    case ServiceType.lawyers:
      searchLawyers(req, res).catch((error) =>
        logger.error("Lists Result Controller", { error })
      );
      break;
    case ServiceType.covidTestProviders:
      searchCovidTestProvider(req, res).catch((error) => {
        logger.error("Lists Result Controller", { error });
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
    const { type } = await listItem.setEmailIsVerified({
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
        default:
          serviceName = "Find a professional service abroad";
      }

      res.render("lists/application-confirmation-page", {
        serviceName,
      });
    }
  } catch (e) {
    next(e);
  }
}

export function listsGetPrivateBetaPage(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { serviceType } = req.query;

  if (serviceType === undefined) {
    return next();
  }

  res.render("lists/private-beta-page", {
    serviceType,
    ServiceType,
  });
}
