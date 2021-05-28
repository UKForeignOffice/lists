import _ from "lodash";
import { countriesList } from "server/services/metadata";
import { ServiceType } from "server/models/types";
import { enforceHttps } from "./helpers";

export const listsRoutes = {
  start: "/",
  finder: "/find",
  results: "/results",
  formRunnerWebhook: "/ingest/:serviceType",
  confirmApplication: "/confirm/:reference",
};

export const DEFAULT_VIEW_PROPS = {
  _,
  countriesList,
  listsRoutes,
  ServiceType,
  enforceHttps,
};
