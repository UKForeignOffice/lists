import Joi from "joi";

export const funeralDirectorsSchema = Joi.object({
  repatriation: Joi.boolean(),
  insurance: Joi.boolean(),
});
