import { getServiceLabel } from "server/components/lists";
import { ServiceType } from "server/models/types";
import { sitemapController } from "../controllers";

describe("SiteMap", () => {
  let mockReq: any;
  let mockRes: any;
  let serviceTypes: string[];
  let exclusions: string[];

  beforeEach(() => {
    mockReq = {};

    mockRes = {
      render: jest.fn(),
    };

    exclusions = [ServiceType.covidTestProviders];

    serviceTypes = Object.keys(ServiceType).filter(
      (name) => !exclusions.includes(name)
    );
  });

  test("a section is rendered for each service type", () => {
    sitemapController(mockReq, mockRes);

    expect(mockRes.render.mock.calls[0][0]).toBe("sitemap");
    expect(mockRes.render.mock.calls[0][1].sections).toBeArrayOfSize(1);
  });

  test("section titles are correct", () => {
    sitemapController(mockReq, mockRes);

    const sections = mockRes.render.mock.calls[0][1].sections;
    sections.forEach((section: any, index: any) => {
      const serviceType = serviceTypes[index];
      expect(section.title).toBe(
        `Find ${getServiceLabel(serviceType)} per country`
      );
    });
  });

  test("section links are correct", () => {
    sitemapController(mockReq, mockRes);

    const sections = mockRes.render.mock.calls[0][1].sections;
    sections.forEach((section: any, index: any) => {
      const serviceType = serviceTypes[index];
      expect(section.links[0].href).toBe(
        `/find?country=Afghanistan&serviceType=${serviceType}`
      );
    });
  });
});
