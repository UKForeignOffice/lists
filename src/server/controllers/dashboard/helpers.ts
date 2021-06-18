import { Request } from "express";
import { UserRoles, List } from "server/models/types";

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

export function userIsListEditor(req: Request, list: List): boolean {
  const email = req.user?.userData.email;
  return email !== undefined ? list.jsonData.editors.includes(email) : false;
}
