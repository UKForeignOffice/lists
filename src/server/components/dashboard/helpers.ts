import { logger } from "server/services/logger";
import axios from "axios";
import type { List, ListJsonData } from "server/models/types";
import type { NewSessionData } from "../formRunner/types";
import { dashboardRoutes } from "server/components/dashboard/routes";
import { sitemapRoute } from "server/components/sitemap/routes";
import { authRoutes } from "server/components/auth";

export type ListWithJsonData = Partial<List> & {
  jsonData: ListJsonData;
};

export async function getInitiateFormRunnerSessionToken(
  formRunnerNewSessionUrl: string,
  formRunnerWebhookData: NewSessionData
): Promise<string> {
  // logger.info(`initiating form runner session via URL ${FORM_RUNNER_URL}, path ${FORM_RUNNER_INITIALISE_SESSION_ROUTE}/${serviceType}`);
  logger.info(`initiating form runner session via URL http://${formRunnerNewSessionUrl}`);
  logger.info(`sending url to ${formRunnerNewSessionUrl} with data [${JSON.stringify(formRunnerWebhookData)}]`);

  const token = await axios
    .post(`http://${formRunnerNewSessionUrl}`, formRunnerWebhookData)
    .then((response) => {
      return response?.data?.token;
    })
    .catch((error) => {
      logger.error(
        `getInitiateFormRunnerSessionToken: Error received after calling form runner URL ${formRunnerNewSessionUrl}. ${error.message}`
      );
      throw new Error("Unable to initiate form runner session");
    });

  logger.info(`getInitiateFormRunnerSessionToken: formRunner responded with ${token}`);
  return token;
}

export const pageTitles: Record<string, string> = {
  [dashboardRoutes.usersEdit]: "edit user",
  [dashboardRoutes.usersList]: "user list",
  [dashboardRoutes.lists]: "all provider lists",
  [dashboardRoutes.listsEdit]: "edit provider list",
  [dashboardRoutes.listsItems]: "provider list",
  [dashboardRoutes.listsItem]: "provider details",
  [dashboardRoutes.listsItemDelete]: "confirm delete provider",
  [dashboardRoutes.listsItemPublish]: "confirm publish list item",
  [dashboardRoutes.listsItemRequestChanges]: "confirm request changes to provider",
  [dashboardRoutes.listsItemUpdate]: "confirm update provider",
  [sitemapRoute]: "site map",
  [authRoutes.login]: "login",
  [authRoutes.logout]: "logout",
};
