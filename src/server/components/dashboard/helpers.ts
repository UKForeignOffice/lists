import { Express, Request } from "express";
import { UserRoles, List } from "server/models/types";
import { dashboardRouter } from "./router";

export async function initDashboard(server: Express): Promise<void> {
  server.use(dashboardRouter);
}

export function filterSuperAdminRole(roles: UserRoles[]): UserRoles[] {
  return roles.filter((role) => {
    return role in UserRoles && role !== UserRoles.SuperAdmin;
  });
}

export function userIsListAdministrator(req: Request, list: List): boolean {
  const email = req.user?.userData.email;
  return email !== undefined
    ? list.jsonData.administrators.includes(email)
    : false;
}

export function userIsListPublisher(req: Request, list: List): boolean {
  const email = req.user?.userData.email;
  return email !== undefined ? list.jsonData.publishers.includes(email) : false;
}

export function userIsListValidator(req: Request, list: List): boolean {
  const email = req.user?.userData.email;
  return email !== undefined ? list.jsonData.validators.includes(email) : false;
}
