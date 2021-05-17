import { Request, Response } from "express";

export function cookiesPageGETController(req: Request, res: Response): void {
  res.render("cookies-page.html", {});
}

export function cookiesPagePOSTController(req: Request, res: Response): void {
  res.render("cookies-page.html", {});
}
