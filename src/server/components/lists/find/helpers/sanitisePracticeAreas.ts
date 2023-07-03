import Joi from "joi";
import { legalPracticeAreasList } from "server/services/metadata";

const validPracticeAreas = Joi.array()
  .items(...legalPracticeAreasList, "All")
  .single();
export function sanitisePracticeAreas(practiceAreas: string | string[]): string[] {
  let practiceAreasAsArray = practiceAreas;
  if (!Array.isArray(practiceAreas)) {
    practiceAreasAsArray = decodeURIComponent(practiceAreas).split(",");
  }

  const { value = [] } = validPracticeAreas.validate(practiceAreasAsArray, {
    stripUnknown: { arrays: true },
    covert: true,
  });
  return value;
}
