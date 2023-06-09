import type { NextFunction, Request, Response } from "express";
import { formRunnerPostRequestSchema } from "server/components/formRunner";

export async function feedbackIngest(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { value, error } = formRunnerPostRequestSchema.validate(req.body);

  if (error !== undefined) {
    res.status(400).json({ error: error.message });
    return;
  }

  formatMessage(value);
  try {
  } catch (error) {
    next(error);
  }
}

function formatMessage(value: any) {}
