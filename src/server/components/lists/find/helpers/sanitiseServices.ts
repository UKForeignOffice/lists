import type { ParsedQs } from "qs";
import { translatorsInterpretersSchema } from "./translatorsInterpretersSchema";

export function sanitiseServices(services: string | ParsedQs | string[] | ParsedQs[] = []): string[] {
  const { value = [] } = translatorsInterpretersSchema.extract("services").validate(services, {
    stripUnknown: { arrays: true },
    convert: true,
  });
  return value;
}
