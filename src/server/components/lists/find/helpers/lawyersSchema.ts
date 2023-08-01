import Joi from "joi";
import { legalPracticeAreasList } from "server/services/metadata";

const lowercaseLegalPracticeAreasList = legalPracticeAreasList.map((area) => area.toLowerCase());

const validPracticeAreas = Joi.array()
  .items(...legalPracticeAreasList, ...lowercaseLegalPracticeAreasList, "All")
  .single();
export const lawyersSchema = Joi.object({
  practiceAreas: validPracticeAreas.required(),
});
