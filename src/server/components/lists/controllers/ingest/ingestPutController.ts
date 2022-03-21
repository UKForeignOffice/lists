import { Request, Response } from "express";
import {
  CovidTestSupplierFormWebhookData,
  formRunnerPostRequestSchema,
  LawyersFormWebhookData,
  parseFormRunnerWebhookObject,
} from "server/components/formRunner";
import { listItem } from "server/models";
import { logger } from "server/services/logger";

export async function ingestPutController(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params.id;
  const { value, error } = formRunnerPostRequestSchema.validate(
    req.body ?? {},
    {
      abortEarly: true,
    }
  );

  if (error) {
    res.status(400).send(error).end();
    return;
  }
  const data = parseFormRunnerWebhookObject<
    LawyersFormWebhookData | CovidTestSupplierFormWebhookData
  >(value);

  try {
    await listItem.update(Number(id), data);
    res.status(204).send();
    return;
  } catch (e) {
    logger.error(`listsDataIngestionController Error: ${e.message}`);
    /**
     * TODO:- Queue?
     */

    res.status(422).send(e);
  }
}
