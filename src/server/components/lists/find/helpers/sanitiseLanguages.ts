import Joi from "joi";
import { languages } from "server/services/metadata";
import type { ParsedQs } from "qs";

const languageCodes = Object.keys(languages);
const validPracticeAreas = Joi.array()
  .items(...languageCodes)
  .single();
export function sanitiseLanguages(languages: string | string[] | ParsedQs | ParsedQs[] = []): string[] {
  const { value = [] } = validPracticeAreas.validate(languages, {
    stripUnknown: { arrays: true },
    convert: true,
  });

  // @ts-ignore
  return [...new Set(value)];
}
