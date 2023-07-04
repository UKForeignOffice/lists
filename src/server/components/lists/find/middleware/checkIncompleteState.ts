import type { NextFunction, Request, Response } from "express";
import type { ValidationOptions } from "joi";
import { translatorsInterpretersSchema } from "server/components/lists/find/helpers/translatorsInterpretersSchema";
import { lawyersSchema } from "server/components/lists/find/helpers/lawyersSchema";
import { funeralDirectorsSchema } from "server/components/lists/find/helpers/funeralDirectorsSchema";
import type Joi from "joi";

const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
  stripUnknown: { arrays: true },
  allowUnknown: true,
  convert: true,
};

export function checkIncompleteState(req: Request, res: Response, next: NextFunction) {
  const { serviceType, country } = req.params;
  const { answers = {} } = req.session;

  const serviceTypeParamToSchema: { [key: string]: Joi.ObjectSchema } = {
    "translators-interpreters": translatorsInterpretersSchema,
    lawyers: lawyersSchema,
    "funeral-directors": funeralDirectorsSchema,
  };

  const schema = serviceTypeParamToSchema[serviceType];

  if (!schema) {
    next(404);
    return;
  }

  const { error } = schema.validate(answers, DEFAULT_VALIDATION_OPTIONS);

  if (error) {
    res.redirect(`/find/${serviceType}?country=${country}`);
    return;
  }

  next();
}
