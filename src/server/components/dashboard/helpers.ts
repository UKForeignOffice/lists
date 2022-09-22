import { Request } from "express";
import { logger } from "server/services/logger";
import axios from "axios";
import { List, ListJsonData, UserRoles } from "server/models/types";
import { NewSessionData } from "../formRunner/types";
import { dashboardRoutes } from "server/components/dashboard/routes";
import { sitemapRoute } from "server/components/sitemap/routes";
import { authRoutes } from "server/components/auth";
import serviceName from "server/utils/service-name";

export function filterSuperAdminRole(roles: UserRoles[]): UserRoles[] {
  return roles.filter((role) => {
    return role in UserRoles && role !== UserRoles.SuperAdmin;
  });
}

type ListWithJsonData = Partial<List> & {
  jsonData: ListJsonData;
};

export function userIsListAdministrator(req: Request, list: ListWithJsonData): boolean {
  const email = req.user?.userData.email;
  return email !== undefined ? list?.jsonData?.administrators?.includes(email) : false;
}

export function userIsListPublisher(req: Request, list: ListWithJsonData): boolean {
  const email = req.user?.userData.email;
  return email !== undefined ? list?.jsonData?.publishers?.includes(email) : false;
}

export function userIsListValidator(req: Request, list: ListWithJsonData): boolean {
  const email = req.user?.userData.email;
  return email !== undefined ? list?.jsonData?.validators?.includes(email) : false;
}

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
      logger.info(`response received from formRunnerNewSessionUrl: data ${response?.data}`);
      Object.entries(response).map(([key, value]) =>
        logger.info(`formRunnerNewSessionUrl response ${key} + ":" ${value}`)
      );
      Object.entries(response?.data).map(([key, value]) =>
        logger.info(`formRunnerNewSessionUrl response.data ${key} + ":" ${value}`)
      );
      return response?.data?.token;
    })
    .catch((error) => {
      logger.info(`Error received after calling formRunnerNewSessionUrl ${error}`);
      throw new Error("Unable to initiate form runner session");
    });

  logger.info(`token: ${token}`);
  return token;
}

export const pageTitles: { [key: string]: string } = {
  [dashboardRoutes.usersEdit]: "list management - edit user",
  [dashboardRoutes.usersList]: "list management - user list",
  [dashboardRoutes.lists]: "list management - all provider lists",
  [dashboardRoutes.listsEdit]: "list management - :serviceType in :country - edit provider list",
  [dashboardRoutes.listsItems]: "list management - :serviceType in :country - provider list",
  [dashboardRoutes.listsItem]: "list management - :serviceType in :country - provider details",
  [dashboardRoutes.listsItemDelete]: "list management - :serviceType in :country - confirm delete provider",
  [dashboardRoutes.listsItemPublish]: "list management - :serviceType in :country - confirm publish list item",
  [dashboardRoutes.listsItemRequestChanges]: "list management - :serviceType in :country - confirm request changes to provider",
  [dashboardRoutes.listsItemUpdate]: "list management - :serviceType in :country - confirm update provider",
  [sitemapRoute]: "site map",
  [authRoutes.login]: "list management - login",
  [authRoutes.logout]: "list management - logout",
}

export function getPageTitle(pageTitle: string, serviceType?: string, country?: string): string {
  let result = pageTitle;
  if (serviceType) {
    result = result.replace(":serviceType", serviceName(serviceType));
  }
  return result.replace(":country", country ?? "Undefined");
}
