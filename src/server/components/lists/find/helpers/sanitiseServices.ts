import Joi from "joi";

const validPracticeAreas = Joi.array().items("translation", "interpretation").single();
export function sanitiseServices(practiceAreas: string | string[]): string[] {
  let practiceAreasAsArray = practiceAreas;
  if (!Array.isArray(practiceAreas)) {
    practiceAreasAsArray = decodeURIComponent(practiceAreas).split(",");
  }

  const { value = [] } = validPracticeAreas.validate(practiceAreasAsArray, { stripUnknown: { arrays: true } });
  return value;
}
