import Joi from "joi";
import { languages } from "server/services/metadata";

const languageCodes = Object.keys(languages);
const validPracticeAreas = Joi.array()
  .items(...languageCodes)
  .single();
export function sanitiseLanguages(languages: string | string[]): string[] {
  let languagesAsArray = languages;
  if (!Array.isArray(languages)) {
    languagesAsArray = decodeURIComponent(languages).split(",");
  }

  const { value = [] } = validPracticeAreas.validate(languagesAsArray, {
    stripUnknown: { arrays: true },
    convert: true,
  });
  return value;
}
