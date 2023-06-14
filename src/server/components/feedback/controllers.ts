import type { NextFunction, Request, Response } from "express";
import { formRunnerPostRequestSchema } from "server/components/formRunner";
import type { WebhookData } from "server/components/formRunner";
import { sendContactUsEmail } from "server/services/govuk-notify";
import { logger } from "server/services/logger";

export async function feedbackIngest(req: Request, res: Response, next: NextFunction) {
  const { value, error } = formRunnerPostRequestSchema.validate(req.body);

  if (error !== undefined) {
    logger.error(`${req.originalUrl} validation failed ${error.message}`);
    res.status(400).json({ error: error.message });
    return;
  }

  const personalisation = formatMessage(value);

  try {
    await sendContactUsEmail(personalisation);
    return res.status(200).json({ success: true }).send();
  } catch (error) {
    logger.error(`feedbackIngest Error: ${error.errors ?? error.message}`);
    res.status(400).json({ error: error.message }).send();
  }
}

function formatMessage(webhookData: WebhookData) {
  const data: string[] = [];

  let serviceType = "";
  let country = "";

  const fields = webhookData.questions.flatMap((question) => question.fields);

  fields.forEach((field) => {
    if (field.key === "serviceType") {
      serviceType = field.answer;
    }
    if (field.key === "country") {
      country = field.answer;
    }

    data.push(`##${field.title}
       ${field.answer}
    `);
  });
  const emailSubject = `${serviceType} in ${country}: Apply service contact form`;

  return {
    emailSubject,
    emailPayload: data.join("\r\n\n ## \r\n"),
  };
}
