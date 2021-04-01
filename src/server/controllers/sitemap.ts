import { Request, Response } from "express";
import { countriesList } from "services/metadata";
import { listsFinderStartRoute } from "./lists/lists";

export function sitemapController(req: Request, res: Response): void {
  const sections = [
    {
      title: "Find a lawyer per country",
      links: countriesList.map(({ value }) => {
        return {
          title: value,
          href: `${listsFinderStartRoute}?country=${value}&serviceType=lawyers`,
        };
      }),
    },
  ];

  res.render("sitemap.html", {
    sections,
  });
}
