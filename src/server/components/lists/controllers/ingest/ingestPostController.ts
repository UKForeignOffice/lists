import { Request, Response } from "express";
import { ServiceType } from "server/models/types";
import { formRunnerPostRequestSchema } from "server/components/formRunner";
import { createListItem } from "server/models/listItem/listItem";
import serviceName from "server/utils/service-name";
import { createConfirmationLink } from "server/components/lists/helpers";
import { sendApplicationConfirmationEmail } from "server/services/govuk-notify";
import { logger } from "server/services/logger";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";

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
    const email = jsonData?.publicEmailAddress ?? jsonData?.emailAddress;

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
  } catch (e) {
    logger.error(`listsDataIngestionController Error: ${e.message}`);

    res.status(422).send({
      error: "Unable to process form",
    });
  }
}
