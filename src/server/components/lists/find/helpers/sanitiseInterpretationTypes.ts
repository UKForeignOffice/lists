import { translatorsInterpretersSchema } from "./translatorsInterpretersSchema";

export function sanitiseInterpretationTypes(interpretationTypes: string | string[]): string[] {
  const { value = [] } = translatorsInterpretersSchema.extract("interpretationTypes").validate(interpretationTypes, {
    stripUnknown: { arrays: true },
    convert: true,
  });

  return value;
}
