/**
 * @jest-environment jsdom
 */

import $ from "cheerio";
import { Express } from "express";
import request from "supertest";
import { axe } from "jest-axe";
import { getServer } from "../server";
import * as helpers from "server/models/listItem/providers/helpers";
import * as lawyers from "../models/listItem/providers/Lawyers";
import { LawyerListItem } from "server/models/listItem/providers";
import { findPublishedLawyersPerCountry } from "../models/listItem/providers/Lawyers";

describe("Lawyers List:", () => {
  let server: Express;

  function mockListItemSome(resolvedValue = true): jest.SpyInstance {
    return jest.spyOn(helpers, "some").mockResolvedValue(resolvedValue);
  }

  function mockFindPublishedLawyersPerCountry(): jest.SpyInstance {
    return jest.spyOn(LawyerListItem, "findPublishedLawyersPerCountry");
  }

  beforeAll(async () => {
    mockListItemSome();
    mockFindPublishedLawyersPerCountry();
    server = await getServer();
  }, 30000);

  describe("Lawyer's land page", () => {
    const pageLink = "/find?serviceType=lawyers";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe("Find a lawyer abroad");
      expect(continueButton.text()).toBe("Start");
    });

    test("lawyer's land page accessibility", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });

    test("lawyer's land page POST request is correct", async () => {
      const { status, header } = await request(server)
        .post(pageLink)
        .send({ readNotice: "ok" });

      expect(status).toBe(302);
      expect(header.location).toBe(`${pageLink}&readNotice=ok`);
    });
  });

  describe("lawyer's country question page", () => {
    const pageLink = "/find?serviceType=lawyers&readNotice=ok";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe(
        "In which country do you need a lawyer?"
      );
      expect(continueButton.text()).toBe("Continue");
    });

    test("POST request is correct", async () => {
      const { status, header } = await request(server)
        .post(pageLink)
        .send({ country: "spain" });

      expect(status).toBe(302);
      expect(header.location).toBe(`${pageLink}&country=spain`);
    });

    test("POST request is correct for country name starting with lowercase letter", async () => {
      const { status, header } = await request(server)
        .post(pageLink)
        .send({ country: "northern Cyprus" });

      expect(status).toBe(302);
      expect(helpers.some).toBeCalledWith("northern Cyprus", "lawyers");
      expect(header.location).toBe(`${pageLink}&country=northern%20Cyprus`);
    });

    test("POST request is correct for country name with special character ô", async () => {
      const { status, header } = await request(server)
        .post(pageLink)
        .send({ country: "Côte d'Ivoire" });

      expect(status).toBe(302);
      expect(helpers.some).toBeCalledWith("Côte d'Ivoire", "lawyers");
      expect(header.location).toBe(`${pageLink}&country=C%C3%B4te%20d'Ivoire`);
    });

    test("POST request is correct for country name with special character -", async () => {
      const { status, header } = await request(server)
        .post(pageLink)
        .send({ country: "Guinea-Bissau" });

      expect(status).toBe(302);
      expect(helpers.some).toBeCalledWith("Guinea-Bissau", "lawyers");
      expect(header.location).toBe(`${pageLink}&country=Guinea-Bissau`);
    });

    test("POST request is correct for country name with special character ã, í and é", async () => {
      const { status, header } = await request(server)
        .post(pageLink)
        .send({ country: "São Tomé and Príncipe" });

      expect(status).toBe(302);
      expect(helpers.some).toBeCalledWith("São Tomé And Príncipe", "lawyers");
      expect(header.location).toBe(`${pageLink}&country=S%C3%A3o%20Tom%C3%A9%20and%20Pr%C3%ADncipe`);
    });

    test("accessibility", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  describe("lawyer's region question page", () => {
    const pageLink = "/find?serviceType=lawyers&readNotice=ok&country=spain";
    const pageLinkLowercaseCountry = "/find?serviceType=lawyers&readNotice=ok&country=northern%20Cyprus";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe(
        "Where in Spain do you want to find a lawyer? (Optional)"
      );
      expect(continueButton.text()).toBe("Continue");
    });

    test("GET request is correct for country starting with lowercase letter", async () => {
      const { text } = await request(server).get(pageLinkLowercaseCountry).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe(
        "Where in Northern Cyprus do you want to find a lawyer? (Optional)"
      );
      expect(continueButton.text()).toBe("Continue");
    });

    test("POST request is correct", async () => {
      const { status, header } = await request(server)
        .post(pageLink)
        .send({ region: "madrid" });

      expect(status).toBe(302);
      expect(header.location).toBe(`${pageLink}&region=madrid`);
    });

    test("accessibility", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  describe("Lawyer's legal areas question page", () => {
    const pageLink =
      "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe(
        "In what areas of law do you need legal help?"
      );
      expect(continueButton.text()).toBe("Continue");
    });

    test("POST request is correct", async () => {
      const { status, header } = await request(server)
        .post(pageLink)
        .send({ practiceArea: ["maritime", "real estate"] });

      expect(status).toBe(302);
      expect(header.location).toBe(
        `${pageLink}&practiceArea=maritime,real%20estate`
      );
    });

    test("accessibility", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  describe("Lawyer's disclaimer question page", () => {
    const pageLink =
      "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const main = $html("main");
      const pageHeader = main.find("h1");
      const continueButton = main.find("button");

      expect(pageHeader.text().trim()).toBe("Disclaimer");
      expect(continueButton.text()).toBe("Continue");
    });

    test("POST request is correct", async () => {
      const { status, header } = await request(server)
        .post(pageLink)
        .send({ readDisclaimer: "ok" });

      expect(status).toBe(302);
      expect(header.location).toBe(`${pageLink}&readDisclaimer=ok`);
    });

    test("accessibility", async () => {
      const { text } = await request(server)
        .get(
          "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate"
        )
        .type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  test("Lawyer's final questionary page GET request is correct", async () => {
    // here the controller will check all parameters are correct and if so the user will be redirected to /results with the same query parameters
    const { status, header } = await request(server)
      .get(
        "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&readDisclaimer=ok"
      )
      .type("text/html");

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/results?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&readDisclaimer=ok"
    );
  });

  describe("Lawyers results page", () => {
    test("GET request answers box is correct", async () => {
      const { text } = await request(server)
        .get(
          "/results?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&readDisclaimer=ok"
        )
        .type("text/html");

      expect(await LawyerListItem.findPublishedLawyersPerCountry).toBeCalledWith({
        countryName: "Spain",
        region: "madrid",
        practiceArea: ["maritime","real estate"],
        offset: -1,
      });

      const $html = $.load(text);
      const $main = $html("main");
      const $answerBox = $($main.find(".answers-box"));

      const answers = $answerBox.find("p");

      // country answer
      expect(answers.eq(1).text()).toEqual(`
      Country
      Spain
      Change
    `);

      expect(answers.eq(1).find("a").attr("href")).toEqual(
        "/find?serviceType=lawyers&readNotice=ok&region=madrid&practiceArea=maritime%2Creal%20estate&readDisclaimer=ok"
      );

      // region answer
      expect(answers.eq(2).text()).toEqual(`
      Location
      Madrid
      Change
    `);
      expect(answers.eq(2).find("a").attr("href")).toEqual(
        "/find?serviceType=lawyers&readNotice=ok&country=Spain&practiceArea=maritime%2Creal%20estate&readDisclaimer=ok"
      );

      // legal practice areas
      expect(answers.eq(3).text()).toEqual(`
      Areas of law
      Maritime, Real Estate
      Change
    `);
      expect(answers.eq(3).find("a").attr("href")).toEqual(
        "/find?serviceType=lawyers&readNotice=ok&country=Spain&region=madrid&readDisclaimer=ok"
      );
    });

    test.skip("GET request pageination next when current page is 2", async () => {
      const { text } = await request(server)
        .get(
          "/results?serviceType=lawyers&readNotice=ok&country=italy&region=milan&practiceArea=maritime,real%20estate&readDisclaimer=ok&page=2"
        )
        .type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const $prevLink = $main.find("#prevButton > a");
      expect($prevLink.attr("href")).toEqual(
        `results?serviceType=lawyers&readNotice=ok&country=italy&region=milan&practiceArea=maritime,real%20estate&readDisclaimer=ok&page=1`
      );

      const $nextLink = $($main.find("#nextButton > a"));
      expect($nextLink.attr("href")).toEqual(
        `results?serviceType=lawyers&readNotice=ok&country=italy&region=milan&practiceArea=maritime,real%20estate&readDisclaimer=ok&page=3`
      );
    });

    test("accessibility", async () => {
      const { text } = await request(server)
        .get(
          "/results?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&readDisclaimer=ok&page=1"
        )
        .type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  test("redirect is correct when country has no lawyers available", async () => {
    mockListItemSome(false);

    const { status, header } = await request(server)
      .post("/find?serviceType=lawyers&readNotice=ok&country=spain")
      .type("text/html");

    expect(status).toBe(302);
    expect(helpers.some).toBeCalledWith("Spain", "lawyers");
    expect(header.location).toBe(
      "https://www.gov.uk/government/publications/spain-list-of-lawyers"
    );
  });
});
