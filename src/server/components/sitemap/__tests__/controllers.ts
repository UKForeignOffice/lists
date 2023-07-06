import { getServiceLabel } from "server/components/lists";
import { ServiceType } from "shared/types";
import { sitemapController } from "../controllers";
import { kebabCase } from "lodash";

describe("SiteMap", () => {
  let mockReq: any;
  let mockRes: any;
  let serviceTypes: string[];

  beforeEach(() => {
    mockReq = {};

    mockRes = {
      render: jest.fn(),
    };
    serviceTypes = Object.keys(ServiceType);
  });

  test("a section is rendered for each service type", () => {
    sitemapController(mockReq, mockRes);

    expect(mockRes.render.mock.calls[0][0]).toBe("sitemap");
    expect(mockRes.render.mock.calls[0][1].sections).toBeArrayOfSize(3);
  });

  test("section titles are correct", () => {
    sitemapController(mockReq, mockRes);

    const sections = mockRes.render.mock.calls[0][1].sections;
    sections.forEach((section: any, index: any) => {
      const serviceType = serviceTypes[index];
      expect(section.title).toBe(`Find ${getServiceLabel(serviceType)} per country`);
    });
  });

  test("section links are correct", () => {
    sitemapController(mockReq, mockRes);

    const sections = mockRes.render.mock.calls[0][1].sections;
    sections.forEach((section: any, index: any) => {
      const serviceType = serviceTypes[index];
      const normalisedServiceType = kebabCase(serviceType.toLowerCase());

      expect(section.links[0].href).toBe(`/find/${normalisedServiceType}/Afghanistan`);
    });
  });
});
