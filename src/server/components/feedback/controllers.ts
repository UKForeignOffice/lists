import type { NextFunction, Request, Response } from "express";
import { formRunnerPostRequestSchema } from "server/components/formRunner";
import type { WebhookData } from "server/components/formRunner";
import { sendContactUsEmail } from "server/services/govuk-notify";
import { logger } from "server/services/logger";

export async function feedbackIngest(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { value, error } = formRunnerPostRequestSchema.validate(req.body);

  if (error !== undefined) {
    res.status(400).json({ error: error.message });
    return;
  }

  const personalisation = formatMessage(value);
  const emails = ["digitalservicesfeedback@fco.gov.uk", "richard.bray@cautionyourblast.com"];

  try {
    await sendContactUsEmail(emails, personalisation);
  } catch (error) {
    logger.error(`feedbackIngest Error: ${error.message}`);
    next(error);
  }
}

function formatMessage(webhookData: WebhookData) {
  const data: string[] = [];

  webhookData?.questions?.forEach((question) => {
    data.push("---");
    data.push(`Page: ${question.question}\n`);
    question.fields.forEach((field) => data.push(`*${field.title?.replace("?", "")}: ${field.answer}\n`));
  });
  data.push("---");

  const emailSubject = "test";

  return {
    emailSubject,
    emailPayload: data.join("\r\n"),
  };
}
