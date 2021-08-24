import { Request, Response } from "express";
import { ServiceType } from "server/models/types";
import { countriesList } from "server/services/metadata";
import { listsRoutes } from "../../controllers/lists";
import { getServiceLabel } from "../../controllers/lists/helpers";

export function sitemapController(req: Request, res: Response): void {
  const sections = Object.keys(ServiceType).map(serviceType => {
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
  
  res.render("sitemap.html", {
    sections,
  });
}
