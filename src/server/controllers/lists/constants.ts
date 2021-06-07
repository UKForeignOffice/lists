import { countriesList } from "server/services/metadata";
import { ServiceType } from "server/models/types";
import { enforceHttps } from "./helpers";
import { listsRoutes } from "./routes";

export const DEFAULT_VIEW_PROPS = {
  countriesList,
  listsRoutes,
  ServiceType,
  enforceHttps,
};
