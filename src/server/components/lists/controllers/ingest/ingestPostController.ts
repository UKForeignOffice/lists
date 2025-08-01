import type { Request, Response } from "express";
import { ServiceType } from "shared/types";
import { formRunnerPostRequestSchema } from "server/components/formRunner";
import { createListItem } from "server/models/listItem/listItem";
import serviceName from "server/utils/service-name";
import { createConfirmationLink, getServiceTypeName } from "server/components/lists/helpers";
import { sendApplicationConfirmationEmail } from "server/services/govuk-notify";
import { logger } from "server/services/logger";
import type { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { isDevMode, isLocalHost, isSmokeTest } from "server/config";

export async function ingestPostController(req: Request, res: Response): Promise<void> {
  const serviceType = getServiceTypeName(req.params.serviceType) as ServiceType;
  if (!serviceType) {
    res.status(500).send({
      error: "serviceType is incorrect, please make sure form's webhook output configuration is correct",
    });
    return;
  }
  const { value, error } = formRunnerPostRequestSchema.validate(req.body);

  if (!serviceType || !(serviceType in ServiceType)) {
    res.status(500).send({
      error: "serviceType is incorrect, please make sure form's webhook output configuration is correct",
    });
    return;
  }

  if (error !== undefined) {
    res.status(422).send({ error: error.message });
    return;
  }

  try {
    const item = await createListItem(value);
    const { address, reference, type } = item;
    const typeName = serviceName(type);
    if (!typeName) {
      res.json({});
      return;
    }

    const { country } = address;
    const jsonData = item.jsonData as ListItemJsonData;
    const { contactName } = jsonData;
    const email = jsonData?.emailAddress;

    if (email === null) {
      throw new Error("No email address supplied");
    }

    const confirmationLink = createConfirmationLink(req, reference);
    if (isLocalHost || isDevMode || isSmokeTest) {
      logger.info(`Generated confirmation link: ${confirmationLink}`);
    }

    await sendApplicationConfirmationEmail(contactName, email, typeName, country.name, confirmationLink);

    res.send({});
  } catch (error) {
    logger.error(`ingestPostController Error: ${(error as Error).message}`);

    res.status(422).send({
      error: "Unable to process form",
    });
  }
}
