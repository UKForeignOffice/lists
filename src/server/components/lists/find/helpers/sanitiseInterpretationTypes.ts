import Joi from "joi";
import { interpretationServices } from "server/services/metadata";

const validInterpretationTypes = Joi.array()
  .items("all", ...interpretationServices.map((type) => type.value))
  .single();
export function sanitiseInterpretationTypes(practiceAreas: string | string[]): string[] {
  const { value = [] } = validInterpretationTypes.validate(practiceAreas, {
    stripUnknown: { arrays: true },
    convert: true,
  });

  return value;
}
