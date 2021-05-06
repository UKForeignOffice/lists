import _ from "lodash";
import { countriesList } from "server/services/metadata";

export const listsRoutes = {
  start: "/",
  finder: "/find",
  results: "/results",
  formRunnerWebhook: "/ingest/:serviceType",
  confirmApplication: "/confirm/:applicationReference",
};

export const DEFAULT_VIEW_PROPS = {
  _,
  countriesList,
  listsRoutes,
};
