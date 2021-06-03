import { NextFunction, Request, Response } from "express";
import { get, noop } from "lodash";
import { countryHasLawyers } from "server/models/helpers";
import { trackListsSearch } from "server/services/google-analytics";
import { DEFAULT_VIEW_PROPS } from "./constants";
import { listsRoutes } from "./routes";
import { listItem } from "server/models";
import { ServiceType } from "server/models/types";
import {
  getServiceLabel,
  regionFromParams,
  getAllRequestParams,
  queryStringFromParams,
  parseListValues,
  getCountryLawyerRedirectLink,
  removeQueryParameter,
  createConfirmationLink,
} from "./helpers";
import { logger } from "server/services/logger";
import { legalPracticeAreasList } from "server/services/metadata";
import { questions } from "./questionnaire";
import { QuestionError, QuestionName } from "./types";
import { searchLawyers, lawyersQuestionsSequence } from "./lawyers";
import {
  searchCovidTestProvider,
  covidTestProviderQuestionsSequence,
} from "./covid-test-provider";
import { formRunnerPostRequestSchema } from "./schemas";
import { parseFormRunnerWebhookObject } from "server/services/form-runner";
import {
  CovidTestSupplierFormWebhookData,
  LawyersFormWebhookData,
} from "server/services/form-runner/types";
import { sendApplicationConfirmationEmail } from "server/services/govuk-notify";
import { isCybDev } from "server/config";

export function listsStartPageController(req: Request, res: Response): void {
  return res.render("lists/start-page", {
    nextRoute: listsRoutes.finder,
    previousRoute: listsRoutes.start,
  });
}

export function listsPostController(req: Request, res: Response): void {
  const params = getAllRequestParams(req);
  const region = regionFromParams(params);

  const { country, serviceType } = params;

  if (region !== undefined) {
    params.region = region;
  }

  const queryString = queryStringFromParams(params);

  if (country !== undefined && country !== "" && !countryHasLawyers(country)) {
    // data hasn't been migrated, redirect user to legacy FCDO pages
    trackListsSearch({
      serviceType,
      country,
    }).catch(noop);

    return res.redirect(getCountryLawyerRedirectLink(country));
  }

  res.redirect(`${listsRoutes.finder}?${queryString}`);
}

export function listsGetController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const params = getAllRequestParams(req);
  const queryString = queryStringFromParams(params);
  const { serviceType } = params;

  let questionsSequence: QuestionName[];
  let partialPageTitle: string = "";
  let partialToRender: string = "";
  let error: boolean | QuestionError = false;

  if (serviceType === undefined) {
    res.render("lists/question-page.html", {
      ...DEFAULT_VIEW_PROPS,
      ...params,
      partialToRender: "question-service-type.html",
      getServiceLabel,
    });
    return;
  }

  switch (serviceType) {
    case ServiceType.lawyers:
      questionsSequence = lawyersQuestionsSequence;
      break;
    case ServiceType.covidTestProvider:
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
    res.render("lists/question-page.html", {
      ...DEFAULT_VIEW_PROPS,
      ...params,
      error,
      queryString,
      partialToRender,
      partialPageTitle,
      removeQueryParameter,
      legalPracticeAreasList,
      serviceLabel: getServiceLabel(params.serviceType),
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
  const { serviceType, country, legalAid, region } = params;
  const practiceArea = parseListValues("practiceArea", params);

  trackListsSearch({
    serviceType,
    country,
    region,
    practiceArea: practiceArea?.join(","),
    legalAid,
  }).catch(noop);

  switch (serviceType) {
    case ServiceType.lawyers:
      searchLawyers(req, res).catch((error) =>
        logger.error("Lists Result Controller", { error })
      );
      break;
    case ServiceType.covidTestProvider:
      searchCovidTestProvider(req, res).catch((error) => {
        logger.error("Lists Result Controller", { error });
      });
      break;
    default:
      next();
  }
}

export function listRedirectToLawyersController(
  req: Request,
  res: Response
): void {
  const params = getAllRequestParams(req);
  params.serviceType = ServiceType.lawyers;
  const queryString = queryStringFromParams(params);

  res.redirect(`${listsRoutes.finder}?${queryString}`);
}

export function listsDataIngestionController(req: Request, res: Response): any {
  const serviceType = req.params.serviceType as ServiceType;
  const { value, error } = formRunnerPostRequestSchema.validate(req.body);

  if (!(serviceType in ServiceType)) {
    res.status(500).send({
      error:
        "serviceType is incorrect, please make sure form's webhook output configuration is correct",
    });
    return;
  }

  if (error !== undefined) {
    res.status(422).send({ error: error.message });
    return;
  }

  const data =
    parseFormRunnerWebhookObject<
      LawyersFormWebhookData | CovidTestSupplierFormWebhookData
    >(value);

  listItem
    .createListItem(serviceType, data)
    .then(async (listItem) => {
      const { reference } = listItem;
      const email = get(listItem?.jsonData, "email");

      if (email !== null && !isCybDev) {
        const confirmationLink = createConfirmationLink(req, reference);
        sendApplicationConfirmationEmail(email, confirmationLink).catch(noop);
      }

      res.json({});
    })
    .catch((error) => {
      logger.error(`listsDataIngestionController Error: ${error.message}`);
      res.status(500).send({ error: error.message });
    });
}

export function listsConfirmApplicationController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { reference } = req.params;
  listItem
    .setEmailIsVerified({ reference })
    .then(() => res.render("lists/application-confirmation-page.html"))
    .catch(next);
}
