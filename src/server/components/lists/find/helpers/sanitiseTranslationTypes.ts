import { translatorsInterpretersSchema } from "./translatorsInterpretersSchema";

export function sanitiseTranslationTypes(translationTypes: string | string[]): string[] {
  const { value = [] } = translatorsInterpretersSchema.extract("translationTypes").validate(translationTypes, {
    stripUnknown: { arrays: true },
    convert: true,
  });

  return value;
}
