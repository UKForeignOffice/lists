import Joi from "joi";

const formRunnerQuestionSchema = Joi.object({
  question: Joi.string(),
  category: Joi.string(),
  fields: Joi.array().items(
    Joi.object({
      key: Joi.string(),
      title: Joi.string(),
      type: Joi.string(),
      answer: Joi.alternatives().try(
        Joi.boolean(),
        Joi.string().allow(null),
        Joi.number(),
        Joi.array().items(Joi.string())
      ),
    })
  ),
  index: Joi.number(),
});

export const formRunnerPostRequestSchema = Joi.object({
  name: Joi.string().optional(),
  questions: Joi.array().items(formRunnerQuestionSchema).required(),
  metadata: Joi.object({
    type: Joi.string(),
    paymentSkipped: Joi.boolean().optional(),
  }),
});
