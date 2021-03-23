import { Request, Response } from "express";
import { countriesList } from "services/metadata";
import { finderFormRoute } from "server/routes/service-finder";

export function sitemapController(req: Request, res: Response): void {
  const sections = [
    {
      title: "Find a lawyer per country",
      links: countriesList.map(({value}) => {
        return {
          title: value,
          href: `${finderFormRoute}?country=${value}&serviceType=lawyers`,
        };
      }),
    },
  ];

  res.render("sitemap.html", {
    sections,
  });
}
