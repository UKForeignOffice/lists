import { Request } from "express";
import { logger } from "server/services/logger";
import axios from "axios";
import { List, ListJsonData, UserRoles } from "server/models/types";
import { NewSessionData } from "../formRunner/types";

export function filterSuperAdminRole(roles: UserRoles[]): UserRoles[] {
  return roles.filter((role) => {
    return role in UserRoles && role !== UserRoles.SuperAdmin;
  });
}

type ListWithJsonData = Partial<List> & {
  jsonData: ListJsonData;
};

export function userIsListAdministrator(
  req: Request,
  list: ListWithJsonData
): boolean {
  const email = req.user?.userData.email;
  return email !== undefined
    ? list?.jsonData?.administrators?.includes(email)
    : false;
}

export function userIsListPublisher(
  req: Request,
  list: ListWithJsonData
): boolean {
  const email = req.user?.userData.email;
  return email !== undefined
    ? list?.jsonData?.publishers?.includes(email)
    : false;
}

export function userIsListValidator(
  req: Request,
  list: ListWithJsonData
): boolean {
  const email = req.user?.userData.email;
  return email !== undefined
    ? list?.jsonData?.validators?.includes(email)
    : false;
}

export async function getInitiateFormRunnerSessionToken(
  formRunnerNewSessionUrl: string,
  formRunnerWebhookData: NewSessionData
): Promise<string> {
  // logger.info(`initiating form runner session via URL ${FORM_RUNNER_URL}, path ${FORM_RUNNER_INITIALISE_SESSION_ROUTE}/${serviceType}`);
  logger.info(
    `initiating form runner session via URL http://${formRunnerNewSessionUrl}`
  );
  logger.info(
    `sending url to ${formRunnerNewSessionUrl} with data [${JSON.stringify(
      formRunnerWebhookData
    )}]`
  );

  const token = await axios
    .post(`http://${formRunnerNewSessionUrl}`, formRunnerWebhookData)
    .then((response) => {
      logger.info(
        `response received from formRunnerNewSessionUrl: data ${response?.data}`
      );
      Object.entries(response).map(([key, value]) =>
        logger.info(`formRunnerNewSessionUrl response ${key} + ":" ${value}`)
      );
      Object.entries(response?.data).map(([key, value]) =>
        logger.info(
          `formRunnerNewSessionUrl response.data ${key} + ":" ${value}`
        )
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
