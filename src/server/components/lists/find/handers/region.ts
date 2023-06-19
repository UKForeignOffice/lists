import { URLSearchParams } from "url";
import type { Request, Response } from "express";

export function get(req: Request, res: Response) {
  res.render("lists/find/region", {
    region: req.session.answers?.region,
  });
}

export function post(req: Request, res: Response) {
  const { region } = req.body;
  const encoded = encodeURIComponent(region);

  const params = new URLSearchParams({
    ...req.query,
    ...(encoded && { region: encoded }),
  });

  if (params.get("practice-area")) {
    res.redirect(`result?${params.toString()}`);
    return;
  }

  res.redirect(`practice-areas?${params.toString()}`);
}
