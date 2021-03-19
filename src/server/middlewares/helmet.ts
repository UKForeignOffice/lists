import { RequestHandler } from "express";
import helmet from "helmet";

export default (): RequestHandler =>
  helmet({
    referrerPolicy: { policy: "no-referrer" },
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  });
