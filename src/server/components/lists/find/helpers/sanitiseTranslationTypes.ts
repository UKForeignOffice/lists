import Joi from "joi";
import { translationSpecialties } from "server/services/metadata";

const validTranslationTypes = Joi.array()
  .items("all", ...translationSpecialties.map((type) => type.value))
  .single();
export function sanitiseTranslationTypes(practiceAreas: string | string[]): string[] {
  const { value = [] } = validTranslationTypes.validate(practiceAreas, {
    stripUnknown: { arrays: true },
    convert: true,
  });

  return value;
}
