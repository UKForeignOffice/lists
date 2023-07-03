import Joi from "joi";
import type { ParsedQs } from "qs";

const validPracticeAreas = Joi.array().items("translation", "interpretation").single();
export function sanitiseServices(practiceAreas: string | ParsedQs | string[] | ParsedQs[] = []): string[] {
  const { value = [] } = validPracticeAreas.validate(practiceAreas, {
    stripUnknown: { arrays: true },
    convert: true,
  });
  return value;
}
