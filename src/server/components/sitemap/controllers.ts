import { Request, Response } from "express";
import { ServiceType } from "server/models/types";
import { countriesList } from "server/services/metadata";
import { listsRoutes, getServiceLabel } from "server/components/lists";

export function sitemapController(req: Request, res: Response): void {
  // TODO: Remove filter once lawyers are reinstated
  const sections = Object.keys(ServiceType).filter(name => name !== ServiceType.lawyers).map(serviceType => {
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
