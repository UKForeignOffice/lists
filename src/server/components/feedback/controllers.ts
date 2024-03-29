import type { Request, Response } from "express";
import { formRunnerPostRequestSchema } from "server/components/formRunner";
import type { WebhookData } from "server/components/formRunner";
import { sendContactUsEmail } from "server/services/govuk-notify";
import { logger } from "server/services/logger";

export async function feedbackIngest(req: Request, res: Response) {
  const { value, error } = formRunnerPostRequestSchema.validate(req.body);

  if (error) {
    logger.error(
      `feedbackIngest: validation failed for this url ${req.originalUrl} with error message ${error.message}`
    );
    res.status(400).json({ error: error.message }).send();
    return;
  }

  const personalisation = formatMessage(value);

  try {
    await sendContactUsEmail(personalisation);
    return res.status(200).json({ success: true }).send();
  } catch (error) {
    logger.error(`feedbackIngest: ${error.errors ?? error.message}`);
    res.status(400).json({ error: error.message }).send();
  }
}

function formatMessage(webhookData: WebhookData) {
  const data: string[] = [];
  const isComplaintForm = webhookData.name.includes("complaint");

  let serviceType = "";
  let country = "";

  const fields = webhookData.questions.flatMap((question) => question.fields);

  fields.forEach((field) => {
    let answer = field.answer;

    if (field.key === "serviceType") {
      serviceType = field.answer;
    }
    if (field.key === "country") {
      country = field.answer;
    }
    if (field.key === "reason") {
      answer = `To ${field.answer}`;
    }

    data.push(`##${field.title}
       ${answer ?? "Not entered"}
    `);
  });

  const emailSubject = `${serviceType} in ${country} ${isComplaintForm ? "complaint" : "contact"} form`;

  return {
    emailSubject,
    emailPayload: data.join("\r\n\n ## \r\n"),
  };
}
