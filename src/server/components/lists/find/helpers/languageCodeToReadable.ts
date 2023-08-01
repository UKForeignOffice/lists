import { languages } from "server/services/metadata";

export function languageCodesToReadable(languageCodes: string[]) {
  return languageCodes.map((lang) => languages[lang]);
}
