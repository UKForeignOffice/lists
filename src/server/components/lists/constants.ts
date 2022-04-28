import { countriesList } from "server/services/metadata";
import { ServiceType } from "server/models/types";
import { listsRoutes } from "./routes";
import { dashboardRoutes } from "server/components/dashboard";

export const DEFAULT_VIEW_PROPS = {
  dashboardRoutes,
  countriesList,
  listsRoutes,
  ServiceType,
};
