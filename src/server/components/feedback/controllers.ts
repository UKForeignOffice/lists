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
    logger.error(`feedbackIngest Error: ${error.message}`);
    res.status(400).json({ error: error.message }).send();
  }
}

function formatMessage(webhookData: WebhookData) {
  const data: string[] = [];

  let serviceType = "";

  webhookData?.questions?.forEach((question) => {
    data.push(`Page: ${question.question}\n`);
    question.fields.forEach((field) => {
      if (field.key === "serviceType") {
        serviceType = field.answer;
      }
      data.push(`*${field.title?.replace("?", "")}: ${field.answer}\n`);
    });
  });

  const emailSubject = `Apply service contact form (${serviceType})`;

  return {
    emailSubject,
    emailPayload: data.join("\r\n"),
  };
}
