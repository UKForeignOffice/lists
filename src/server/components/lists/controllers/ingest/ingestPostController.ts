import { Request, Response } from "express";
import { ServiceType } from "server/models/types";
import {
  CovidTestSupplierFormWebhookData,
  formRunnerPostRequestSchema,
  LawyersFormWebhookData,
  parseFormRunnerWebhookObject,
} from "server/components/formRunner";
import { createListItem } from "server/models/listItem/listItem";
import serviceName from "server/utils/service-name";
import { get } from "lodash";
import { createConfirmationLink } from "server/components/lists/helpers";
import { sendApplicationConfirmationEmail } from "server/services/govuk-notify";
import { logger } from "server/services/logger";

export async function ingestPostController(
  req: Request,
  res: Response
): Promise<void> {
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

  try {
    const item = await createListItem(serviceType, data);
    const { address, reference, type } = item;
    const typeName = serviceName(type);

    if (typeName !== undefined) {
      const { country } = address;
      const contactName = get(item.jsonData, "contactName");
      const email =
        get(item.jsonData, "contactEmailAddress") ??
        get(item.jsonData, "publicEmailAddress") ??
        get(item.jsonData, "email") ??
        get(item.jsonData, "emailAddress");

      if (email === null) {
        throw new Error("No email address supplied");
      }

      const confirmationLink = createConfirmationLink(req, reference);

      await sendApplicationConfirmationEmail(
        contactName,
        email,
        typeName,
        country.name,
        confirmationLink
      );
    }

    res.json({});
  } catch (e) {
    logger.error(`listsDataIngestionController Error: ${e.message}`);

    res.status(422).send({
      error: "Unable to process form",
    });
  }
}
