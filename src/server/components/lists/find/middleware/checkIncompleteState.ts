import type { NextFunction, Request, Response } from "express";
import type { ValidationOptions } from "joi";
import { translatorsInterpretersSchema } from "server/components/lists/find/helpers/translatorsInterpretersSchema";
import { lawyersSchema } from "server/components/lists/find/helpers/lawyersSchema";
import { funeralDirectorsSchema } from "server/components/lists/find/helpers/funeralDirectorsSchema";
import type Joi from "joi";
import { getStringRouteParam } from "server/utils/route-params";

const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
  stripUnknown: { arrays: true },
  allowUnknown: true,
  convert: true,
};

export function checkIncompleteState(req: Request, res: Response, next: NextFunction) {
  const serviceType = getStringRouteParam(req.params, "serviceType");
  const country = getStringRouteParam(req.params, "country");
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

  const validationOptions =
    serviceType === "translators-interpreters"
      ? { ...DEFAULT_VALIDATION_OPTIONS, context: { services: answers.services } }
      : DEFAULT_VALIDATION_OPTIONS;
  const { error } = schema.validate(answers, validationOptions);

  if (error) {
    res.redirect(`/find/${serviceType}?country=${country}`);
    return;
  }

  next();
}
