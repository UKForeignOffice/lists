import type { Request, Response } from "express";
import { ServiceType } from "shared/types";
import { countriesList } from "server/services/metadata";
import { getServiceLabel } from "server/components/lists";
import { pageTitles } from "server/components/dashboard/helpers";
import { kebabCase } from "lodash";

function normaliseServiceType(serviceType: string) {
  return kebabCase(serviceType).toLowerCase();
}
export function sitemapController(_req: Request, res: Response): void {
  const sections = Object.keys(ServiceType).map((serviceType) => {
    return {
      title: `Find ${getServiceLabel(serviceType)} per country`,
      links: countriesList.map(({ value }) => {
        return {
          title: value,
          href: `/find/${normaliseServiceType(serviceType)}?country=${value}`,
        };
      }),
    };
  });

  res.render("sitemap", {
    sections,
    pageTitle: pageTitles.sitemapRoute,
  });
}
