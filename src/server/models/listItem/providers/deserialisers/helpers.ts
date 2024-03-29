import { uniq } from "lodash";
import * as FormRunner from "server/components/formRunner";

function trim(string: string): string {
  return string.trim();
}

export function checkboxCSVToArray<T extends string | string[] = string>(checkboxValue: T): string[] {
  if (Array.isArray(checkboxValue)) {
    return checkboxValue.map(trim);
  }

  // @ts-ignore
  return uniq((checkboxValue ?? "").split(",").map(trim));
}

export function trimAnswer(answer: FormRunner.Field["answer"]): FormRunner.Field["answer"] {
  if (typeof answer === "string") {
    return answer.trim();
  }
  return answer;
}
