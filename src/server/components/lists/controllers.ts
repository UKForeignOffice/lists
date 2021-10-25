import { NextFunction, Request, Response } from "express";
import { get, noop } from "lodash";
import { listsRoutes } from "./routes";
import { listItem } from "server/models";
import { DEFAULT_VIEW_PROPS } from "./constants";
import { ServiceType } from "server/models/types";
import {
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  queryStringFromParams,
  createConfirmationLink,
  getCountryLawyerRedirectLink,
} from "./helpers";
import { questions } from "./questionnaire";
import { logger } from "server/services/logger";
import { QuestionError, QuestionName } from "./types";
import { legalPracticeAreasList } from "server/services/metadata";
import { searchLawyers, lawyersQuestionsSequence } from "./searches/lawyers";
import {
  searchCovidTestProvider,
  covidTestProviderQuestionsSequence,
} from "./searches/covid-test-provider";
import {
  LawyersFormWebhookData,
  formRunnerPostRequestSchema,
  parseFormRunnerWebhookObject,
  CovidTestSupplierFormWebhookData,
} from "server/components/formRunner";
import { sendApplicationConfirmationEmail } from "server/services/govuk-notify";

export async function listsPostController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const params = getAllRequestParams(req);
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
  const queryString = queryStringFromParams(params);
  const { serviceType } = params;

  let questionsSequence: QuestionName[];
  let partialPageTitle: string = "";
  let partialToRender: string = "";
  let error: boolean | QuestionError = false;

  if (serviceType === undefined) {
    res.render("lists/question-page.njk", {
      ...DEFAULT_VIEW_PROPS,
      ...params,
      partialToRender: "question-service-type.njk",
      getServiceLabel,
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
    res.render("lists/question-page.njk", {
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

export function listsDataIngestionController(
  req: Request,
  res: Response
): void {
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

  const data = parseFormRunnerWebhookObject<
    LawyersFormWebhookData | CovidTestSupplierFormWebhookData
  >(value);

  listItem
    .createListItem(serviceType, data)
    .then(async (listItem) => {
      const { reference } = listItem;
      const contactName = get(listItem?.jsonData, "contactName");
      const email =
        get(listItem?.jsonData, "contactEmailAddress") ??
        get(listItem?.jsonData, "email");

      if (email !== null) {
        const confirmationLink = createConfirmationLink(req, reference);
        sendApplicationConfirmationEmail(
          contactName,
          email,
          confirmationLink
        ).catch(noop);
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
    .then(() => res.render("lists/application-confirmation-page.njk"))
    .catch(next);
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

  res.render("lists/private-beta-page.njk", {
    serviceType,
    ServiceType,
  });
}
