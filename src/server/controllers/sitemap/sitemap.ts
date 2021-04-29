import { Request, Response } from "express";
import { countriesList } from "server/services/metadata";
import { listsRoutes } from "../lists";

export function sitemapController(req: Request, res: Response): void {
  const sections = [
    {
      title: "Find a lawyer per country",
      links: countriesList.map(({ value }) => {
        return {
          title: value,
          href: `${listsRoutes.start}?country=${value}&serviceType=lawyers`,
        };
      }),
    },
  ];

  res.render("sitemap.html", {
    sections,
  });
}
