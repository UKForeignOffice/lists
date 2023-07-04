import Joi from "joi";
import { legalPracticeAreasList } from "server/services/metadata";

const validPracticeAreas = Joi.array()
  .items(...legalPracticeAreasList, "All")
  .single();
export const lawyersSchema = Joi.object({
  practiceAreas: validPracticeAreas.required(),
});
