import { get, noop } from "lodash";
import { NextFunction, Request, Response } from "express";

import { listItem } from "server/models";
import { lawyersPostRequestSchema } from "./schemas";
import { DEFAULT_VIEW_PROPS } from "./constants";
import { sendApplicationConfirmationEmail } from "server/services/govuk-notify";
import {
  parseFormRunnerWebhookObject,
  LawyersFormWebhookData,
} from "server/services/form-runner";
import {
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  queryStringFromParams,
  practiceAreaFromParams,
  createConfirmationLink,
} from "./helpers";
import { logger } from "server/services/logger";
import { QuestionName } from "./types";

export const lawyersQuestionsSequence = [
  QuestionName.readNotice,
  QuestionName.country,
  QuestionName.region,
  QuestionName.practiceArea,
  QuestionName.legalAid,
  QuestionName.proBono,
  QuestionName.readDisclaimer,
];

export async function searchLawyers(
  req: Request,
  res: Response
): Promise<void> {
  const params = getAllRequestParams(req);
  const { serviceType, country, legalAid, region, proBono } = params;
  const practiceArea = practiceAreaFromParams(params);

  const searchResults = await listItem.findPublishedLawyersPerCountry({
    countryName: country,
    region,
    legalAid,
    proBono,
    practiceArea,
  });

  res.render("lists/results-page.html", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    searchResults: searchResults,
    removeQueryParameter,
    queryString: queryStringFromParams(params),
    serviceLabel: getServiceLabel(serviceType),
  });
}

export function lawyersDataIngestionController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { value, error } = lawyersPostRequestSchema.validate(req.body);

  if (error !== undefined) {
    res.status(422).send({
      error: error.message,
    });
  } else {
    const data = parseFormRunnerWebhookObject<LawyersFormWebhookData>(value);

    listItem
      .createLawyerListItem(data)
      .then(async (lawyer) => {
        const { reference } = lawyer;
        const email = get(lawyer?.jsonData, "email");

        if (email !== null) {
          const confirmationLink = createConfirmationLink(req, reference);
          sendApplicationConfirmationEmail(email, confirmationLink).catch(noop);
        }

        res.json({});
      })
      .catch((error) => {
        next(new Error("Error while creating new lawyer"));
        logger.error(`lawyersDataIngestionController Error: ${error.message}`);
      });
  }
}
