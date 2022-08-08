/**
 * @jest-environment jsdom
 */

import $ from "cheerio";
import { Express } from "express";
import request from "supertest";
import { axe } from "jest-axe";
import { getServer } from "../server";
import * as helpers from "server/models/listItem/providers/helpers";

describe("Covid Test Providers List:", () => {
  let server: Express;

  function mockListItemSome(resolvedValue = true): jest.SpyInstance {
    return jest.spyOn(helpers, "some")?.mockResolvedValue(resolvedValue);
  }

  beforeAll(async () => {
    mockListItemSome();
    server = await getServer();
  }, 30000);

  describe("Covid Test Providers' land page", () => {
    const pageLink = "/find?serviceType=covidTestProviders";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe(
        "Find a COVID-19 test provider abroad"
      );
      expect(continueButton.text()).toBe("Start now");
    });

    test("Covid Test Providers land page accessibility", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });

    test("Covid Test Providers land page POST request is correct", async () => {
      const { status, header } = await request(server)
        .post(pageLink)
        .send({ readNotice: "ok" });

      expect(status).toBe(302);
      expect(header.location).toBe(`${pageLink}&readNotice=ok`);
    });
  });

  describe("Covid Test Providers country question page", () => {
    const pageLink = "/find?serviceType=covidTestProviders&readNotice=ok";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe(
        "In which country do you need a COVID-19 test provider?"
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

    test("accessibility", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  describe("Covid Test Providers region question page", () => {
    const pageLink =
      "/find?serviceType=covidTestProviders&readNotice=ok&country=spain";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe(
        "Where in Spain do you want to find a COVID-19 test provider? (Optional)"
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

  describe("Covid Test Providers turnaround question page", () => {
    const pageLink =
      "/find?serviceType=covidTestProviders&readNotice=ok&country=spain&region=madrid";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe(
        "How fast do you need your result from when you take the test?"
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

  describe("Covid Test Providers disclaimer question page", () => {
    const pageLink =
      "/find?serviceType=covidTestProviders&readNotice=ok&country=spain&region=madrid&resultsTurnaround=12";

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
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  test("Covid Test Providers final questionary page GET request is correct", async () => {
    // here the controller will check all parameters are correct and if so the user will be redirected to /results with the same query parameters
    const { status, header } = await request(server)
      .get(
        "/find?serviceType=covidTestProviders&readNotice=ok&country=spain&region=madrid&resultsTurnaround=12&readDisclaimer=ok"
      )
      .type("text/html");

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/results?serviceType=covidTestProviders&readNotice=ok&country=spain&region=madrid&resultsTurnaround=12&readDisclaimer=ok"
    );
  });

  describe("Covid Test Providers results page", () => {
    test("GET request answers box is correct", async () => {
      const { text } = await request(server)
        .get(
          "/results?serviceType=covidTestProviders&readNotice=ok&country=spain&region=madrid&resultsTurnaround=12&readDisclaimer=ok"
        )
        .type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const $answerBox = $($main.find(".answers-box"));

      const answers = $answerBox.find("p");

      // country answer
      expect(answers.eq(1).text()).toEqual(`
      Country
      spain
      Change
    `);

      expect(answers.eq(1).find("a").attr("href")).toEqual(
        "/find?serviceType=covidTestProviders&readNotice=ok&region=madrid&resultsTurnaround=12&readDisclaimer=ok"
      );

      // region answer
      expect(answers.eq(2).text()).toEqual(`
      Location
      Madrid
      Change
    `);
      expect(answers.eq(2).find("a").attr("href")).toEqual(
        "/find?serviceType=covidTestProviders&readNotice=ok&country=spain&resultsTurnaround=12&readDisclaimer=ok"
      );

      // turnaround
      expect(answers.eq(3).text().replace(/\s\s+/g, " ")).toEqual(
        `
        Results speed
        12 hours
        Change
      `.replace(/\s\s+/g, " ")
      );
      expect(answers.eq(3).find("a").attr("href")).toEqual(
        "/find?serviceType=covidTestProviders&readNotice=ok&country=spain&region=madrid&readDisclaimer=ok"
      );
    });

    test("accessibility", async () => {
      const { text } = await request(server)
        .get(
          "/results?serviceType=covidTestProviders&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no&readDisclaimer=ok"
        )
        .type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  test("redirect is correct when country has no covid test providers available", async () => {
    mockListItemSome(false);

    const { status, header } = await request(server)
      .post("/find?serviceType=covidTestProviders&readNotice=ok&country=spain")
      .type("text/html");

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/private-beta?serviceType=covidTestProviders"
    );
  });
});
