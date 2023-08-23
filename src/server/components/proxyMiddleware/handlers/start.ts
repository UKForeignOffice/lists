import type { Request, Response } from "express";
import { serviceTypeSchema } from "server/components/proxyMiddleware/helpers";

export function get(req: Request, res: Response) {
  const { value: serviceType } = serviceTypeSchema.validate(req.params.serviceType);

  req.session.application ??= {};
  res.render(`apply/${serviceType}/start`);
}
