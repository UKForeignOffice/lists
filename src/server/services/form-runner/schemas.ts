import Joi from "joi";

const formRunnerQuestionSchema = Joi.object({
  question: Joi.string(),
  category: Joi.string(),
  fields: Joi.array().items(
    Joi.object({
      key: Joi.string(),
      title: Joi.string(),
      type: Joi.string(),
      answer: Joi.alternatives().try(Joi.boolean(), Joi.string().allow(null), Joi.number()),
    })
  ),
  index: Joi.number(),
});

export const formRunnerPostRequestSchema = Joi.object({
  questions: Joi.array().items(formRunnerQuestionSchema).required(),
}).options({ stripUnknown: true });
