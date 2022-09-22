import { Request, Response } from "express";
import { ServiceType } from "server/models/types";
import { countriesList } from "server/services/metadata";
import { listsRoutes, getServiceLabel } from "server/components/lists";
import { pageTitles } from "server/components/dashboard/helpers";
import { sitemapRoute } from "server/components/sitemap/routes";

export function sitemapController(_req: Request, res: Response): void {
  const exclude: string[] = [
    ServiceType.covidTestProviders,
  ];
  const sections = Object.keys(ServiceType)
    .filter((name) => !exclude.includes(name))
    .map((serviceType) => {
      return {
        title: `Find ${getServiceLabel(serviceType)} per country`,
        links: countriesList.map(({ value }) => {
          return {
            title: value,
            href: `${listsRoutes.finder}?country=${value}&serviceType=${serviceType}`,
          };
        }),
      };
    });

  res.render("sitemap", {
    sections,
    pageTitle: pageTitles[sitemapRoute],
  });
}
