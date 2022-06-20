export { FORM_RUNNER_URL } from "server/config"
export const FORM_RUNNER_INITIALISE_SESSION_ROUTE = "/session";
export const FORM_RUNNER_BASE_ROUTE = "/application";

export enum QuestionName {
  "list" = "Which list of lawyers do you want to be added to?",
  "country" = "country",
  "region" = "region",
  "practiceArea" = "practiceArea",
  "readDisclaimer" = "readDisclaimer",
  "resultsTurnaround" = "resultsTurnaround",
  "readCovidDisclaimer" = "readCovidDisclaimer",
}
