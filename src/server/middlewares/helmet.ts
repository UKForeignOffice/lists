import { RequestHandler } from "express";
import helmet from "helmet";

export default (): RequestHandler =>
  helmet({
    referrerPolicy: { policy: "no-referrer" },
    contentSecurityPolicy: false, // TODO: this is breaking dev process.env.NODE_ENV === "production" ? undefined : false,
  });
