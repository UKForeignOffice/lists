import { Request, Response } from "express";
import { dashboardRoutes } from "./routes";

const DEFAULT_VIEW_PROPS = {
  dashboardRoutes,
};

export function startRouteController(req: Request, res: Response): void {
  res.render("dashboard/dashboard.html", {
    ...DEFAULT_VIEW_PROPS,
    req,
  });
}

export function usersRouteController(req: Request, res: Response): void {
  res.render("dashboard/users.html", {
    ...DEFAULT_VIEW_PROPS,
    req,
  });
}

export function listsRouteController(req: Request, res: Response): void {
  res.render("dashboard/lists.html", {
    ...DEFAULT_VIEW_PROPS,
    req,
  });
}
