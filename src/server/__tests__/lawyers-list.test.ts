/**
 * @jest-environment jsdom
 */

import * as $ from "cheerio";
import { Express } from "express";
import request from "supertest";
import { axe } from "jest-axe";
import nunjucks from "nunjucks";
import { getServer } from "../server";
import * as helpers from "server/models/listItem/providers/helpers";
import * as lawyers from "../models/listItem/providers/Lawyers";
import { LawyerListItem } from "server/models/listItem/providers";
import { findPublishedLawyersPerCountry } from "../models/listItem/providers/Lawyers";
import * as getRelatedLinksModule from "../components/lists/searches/helpers/getRelatedLinks";

describe("Lawyers List:", () => {
  let server: Express;

  function mockListItemSome(resolvedValue = true): jest.SpyInstance {
    return jest.spyOn(helpers, "some").mockResolvedValue(resolvedValue);
  }

  function mockFindPublishedLawyersPerCountry(): jest.SpyInstance {
    return jest.spyOn(LawyerListItem, "findPublishedLawyersPerCountry");
  }

  function mockFindRelatedListItems(): jest.SpyInstance {
    return jest.spyOn(getRelatedLinksModule, "getRelatedLinks").mockResolvedValue([]);
  }

  beforeAll(async () => {
    mockListItemSome();
    mockFindPublishedLawyersPerCountry();
    mockFindRelatedListItems();
    server = await getServer();
  }, 30000);

  describe("Lawyer's land page", () => {
    const pageLink = "/find/lawyers";

    test("old URL is redirected to new URL", async () => {
      const res = await request(server).get("/find?serviceType=lawyers");
      const { status } = res;
      expect(status).toBe(302);
    });

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("a[href='lawyers/country']");

      expect(pageHeader.text().trim()).toBe("Find a lawyer abroad");
      expect(continueButton.text()).toBe("Start");
    });

    test("lawyer's land page accessibility", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  describe("lawyer's country question page", () => {
    const pageLink = "/find/lawyers/country";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe("In which country do you need a lawyer?");
      expect(continueButton.text()).toBe("Continue");
    });

    test("POST request is correct", async () => {
      const { status, header, text } = await request(server).post(pageLink).send({ country: "Spain" });

      expect(status).toBe(302);
      expect(header.location).toBe("Spain/region");
    });

    test("POST request is correct for country name starting with lowercase letter", async () => {
      const { status, header } = await request(server).post(pageLink).send({ country: "northern Cyprus" });

      expect(status).toBe(302);
      expect(helpers.some).toBeCalledWith("northern Cyprus", "lawyers");
      expect(header.location).toBe(`northern%20Cyprus/region`);
    });

    test("POST request is correct for country name with special character ô", async () => {
      const { status, header } = await request(server).post(pageLink).send({ country: "Côte d'Ivoire" });

      expect(status).toBe(302);
      expect(helpers.some).toBeCalledWith("Côte d'Ivoire", "lawyers");
      expect(header.location).toBe(`C%C3%B4te%20d'Ivoire/region`);
    });

    test("POST request is correct for country name with special character -", async () => {
      const { status, header } = await request(server).post(pageLink).send({ country: "Guinea-Bissau" });

      expect(status).toBe(302);
      expect(helpers.some).toBeCalledWith("Guinea-Bissau", "lawyers");
      expect(header.location).toBe(`Guinea-Bissau/region`);
    });

    test("POST request is correct for country name with special character ã, í and é", async () => {
      const { status, header } = await request(server).post(pageLink).send({ country: "São Tomé and Príncipe" });

      expect(status).toBe(302);
      expect(helpers.some).toBeCalledWith("São Tomé And Príncipe", "lawyers");
      expect(header.location).toBe(`S%C3%A3o%20Tom%C3%A9%20and%20Pr%C3%ADncipe/region`);
    });

    test("accessibility", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  describe("lawyer's region question page", () => {
    const pageLink = "/find/lawyers/Spain/region";
    const pageLinkLowercaseCountry = "/find/lawyers/northern%20Cyprus/region";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe("Where in Spain do you want to find a lawyer? (Optional)");
      expect(continueButton.text()).toBe("Continue");
    });

    test("GET request is correct for country starting with lowercase letter", async () => {
      const { text } = await request(server).get(pageLinkLowercaseCountry).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe("Where in northern Cyprus do you want to find a lawyer? (Optional)");
      expect(continueButton.text()).toBe("Continue");
    });

    test("POST request is correct", async () => {
      const { status, header } = await request(server).post(pageLink).send({ region: "madrid" });

      expect(status).toBe(302);
      expect(header.location).toBe(`practice-areas?region=madrid`);
    });

    test("POST sanitises region and redirects correctly", async () => {
      const maliciousInput = `<script>alert("xss")</script>Madrid`;
      const expectedSanitised = "scriptalertxssscriptMadrid";
      const { status, header } = await request(server)
        .post(pageLink)
        .send({ region: maliciousInput });

      expect(status).toBe(302);
      expect(header.location).toBe(`practice-areas?region=${encodeURIComponent(expectedSanitised)}`);
    });
    
    test("accessibility", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  describe("Lawyer's legal areas question page", () => {
    const pageLink = "/find/lawyers/spain/practice-areas?region=madrid";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe("In what areas of law do you need legal help?");
      expect(continueButton.text()).toBe("Continue");
    });

    test("POST request is correct", async () => {
      const { status, text, header } = await request(server)
        .post(pageLink)
        .send({ practiceArea: ["Maritime", "Real estate"] });

      expect(status).toBe(302);
      expect(header.location).toBe(`disclaimer`);
    });

    test("accessibility", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  describe("Lawyer's disclaimer question page", () => {
    const pageLink = "/find/lawyers/spain/disclaimer";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const main = $html("main");
      const pageHeader = main.find("h1");
      const continueButton = main.find("button");

      expect(pageHeader.text().trim()).toBe("Disclaimer");
      expect(continueButton.text()).toBe("Continue");
    });

    test("accessibility", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  describe("lawyer search results", () => {
    const warningText =
      "Warning You should do your own research before deciding which provider to use. You may also want to check if any insurance policies you have include legal cover before you contact a lawyer independently.";

    function renderResults(country: string, searchResults: object[]) {
      return nunjucks.render("lists/find/lawyers/results.njk", {
        serviceType: "lawyers",
        country,
        answers: {},
        searchResults,
        relatedLinks: [],
        pagination: {
          results: { count: searchResults.length, from: 1, to: searchResults.length, currentPage: 1 },
          previous: { href: "" },
          next: { href: "" },
          items: [{ text: "1" }],
        },
      });
    }

    test.each(["Spain", "Italy"])("shows the approved warning before lawyers in %s", async (country) => {
      const text = renderResults(country, [
        {
          jsonData: { organisationName: "Example Law Firm", websiteAddress: "https://example.com" },
          address: { firstLine: "Example Street" },
        },
      ]);

      const $html = $.load(text);
      const $main = $html("main .govuk-grid-column-two-thirds");
      const warning = $main.find(".govuk-warning-text");
      const firstLawyer = $main.find("ul.govuk-list li h2 a[href='https://example.com']");

      expect(warning).toHaveLength(1);
      expect(warning.find(".govuk-warning-text__text").text().replace(/\s+/g, " ").trim()).toBe(warningText);
      expect(warning.find(".govuk-warning-text__assistive").text()).toBe("Warning");
      expect(firstLawyer).toHaveLength(1);
      expect($main.children().toArray().indexOf(warning[0])).toBeLessThan(
        $main.children().toArray().indexOf(firstLawyer.closest("ul")[0])
      );
      expect(await axe(`<main>${warning.toString()}</main>`)).toHaveNoViolations();
    });

    test("shows the warning even if no lawyers match", async () => {
      const text = renderResults("Spain", []);
      const $html = $.load(text);

      expect($html("main .govuk-warning-text__text").text().replace(/\s+/g, " ").trim()).toBe(warningText);
      expect($html("main").text()).toContain("We couldn’t find any results");
    });

    test("uses the same warning on lawyer landing and country pages", async () => {
      for (const url of ["/find/lawyers", "/find/lawyers?country=Spain"]) {
        const { text } = await request(server).get(url);
        const $html = $.load(text);

        expect($html("main .govuk-warning-text__text").text().replace(/\s+/g, " ").trim()).toBe(warningText);
      }
    });
  });
});
