import $ from "cheerio";
import { Express } from "express";
import request from "supertest";
import { getServer } from "../server";

describe("Cookies", () => {
  const sitemapPath = "/sitemap";
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  test("sitemap route loads successfully", async () => {
    const { status, text } = await request(server)
      .get(sitemapPath)
      .type("text/html");

    const $html = $.load(text);
    const $main = $html("main");
    const pageHeader = $main.find("h1");

    expect(pageHeader.text()).toBe("Sitemap");
    expect(status).toBe(200);
  });

  test("sitemap link loads successfully", async () => {
    const { text } = await request(server).get(sitemapPath).type("text/html");

    const $html = $.load(text);
    const $main = $html("main");
    const sectionLists = $main.find("ul").toArray();

    for (const section of sectionLists) {
      const $section = $(section);
      const $links = $section.find("a");
      const $link = $links.eq(0);

      const { status } = await request(server)
        .get(`${$link.attr("href")}`)
        .type("text/html");
      expect(status).toBe(200);
    }
  });
});
