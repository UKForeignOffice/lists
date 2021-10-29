import { Router } from "express";
import { statusController } from "./controllers";
import { routes } from "./routes";

export const router = Router();

router.get(routes.status, statusController);
