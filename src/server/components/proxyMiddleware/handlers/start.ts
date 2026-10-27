import type { Request, Response } from "express";
import { serviceTypeSchema } from "server/components/proxyMiddleware/helpers";
import { getStringRouteParam } from "server/utils/route-params";

export function get(req: Request, res: Response) {
  const { value: serviceType } = serviceTypeSchema.validate(getStringRouteParam(req.params, "serviceType"));

  req.session.application ??= {};
  res.render(`apply/${serviceType}/start`);
}
