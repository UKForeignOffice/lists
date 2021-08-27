import { Express } from "express";
import { dashboardRouter } from "./router";

export { dashboardRoutes } from "./routes";
export async function initDashboard(server: Express): Promise<void> {
  server.use(dashboardRouter);
}
