import { lawyersSchema } from "server/components/lists/find/helpers/lawyersSchema";

export function sanitisePracticeAreas(practiceAreas: string | string[]): string[] {
  let practiceAreasAsArray = practiceAreas;
  if (!Array.isArray(practiceAreas)) {
    practiceAreasAsArray = decodeURIComponent(practiceAreas).split(",");
  }

  const { value = [] } = lawyersSchema.extract("practiceAreas").validate(practiceAreasAsArray, {
    stripUnknown: { arrays: true },
    convert: true,
  });
  return value;
}
