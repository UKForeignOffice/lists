import { Request, Response } from "express";
import { formRunnerPostRequestSchema } from "server/components/formRunner";
import { listItem } from "server/models";
import { logger } from "server/services/logger";

export async function ingestPutController(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params.id;

  try {
    const { value } = formRunnerPostRequestSchema.validate(req.body);
    await listItem.update(Number(id), value);
    res.status(204).send();
  } catch (e) {
    logger.error(`listsDataIngestionController Error: ${e.message}`);
    /**
     * TODO:- Queue?
     */
    res.status(422).send({
      error: "Unable to process form",
    });
  }
}
