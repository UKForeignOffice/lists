import express from "express";
import { kebabCase } from "lodash";
import * as serviceType from "./handers/service-type";
import * as country from "./handers/country";

export const findRouter = express.Router();

findRouter.post("*", (req, res, next) => {
  res.locals.csrfToken = req?.csrfToken?.() ?? "";
  next();
});

function normaliseServiceType(serviceType: string) {
  return kebabCase(serviceType.toLowerCase());
}
findRouter.param("serviceType", (req, res, next, serviceType) => {
  res.locals.find = {
    serviceType: normaliseServiceType(serviceType),
  };

  next();
});

findRouter.get("/service-type");
findRouter.get("/:serviceType", serviceType.get);
findRouter.get("/:serviceType/country", country.get);
findRouter.get("/:serviceType/:country");
findRouter.get("/:serviceType/:country/region");
findRouter.get("/:serviceType/:country/:region");
