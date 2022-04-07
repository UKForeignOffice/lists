import { Request } from "express";
import { FormRunnerNewSessionData } from "server/components/formRunner";
import axios from "axios";
import { logger } from "server/services/logger";
import {
  UserRoles,
  List,
  LawyerListItemJsonData,
  ListJsonData,
} from "server/models/types";

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

export async function getInitiateFormRunnerSessionToken(formRunnerNewSessionUrl: string,
                                                        formRunnerWebhookData: FormRunnerNewSessionData): Promise<string> {
  return await axios.post(formRunnerNewSessionUrl, formRunnerWebhookData)
    .then((response) => {
      return response.data.token;
    })
    .catch((error) => {
      logger.info(error);
      throw new Error("Unable to initiate form runner session");
    });
}
