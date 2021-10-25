import $ from "cheerio";
import { Express } from "express";
import request from "supertest";
import { axe } from "jest-axe";
import { getServer } from "../server";
import { listItem } from "server/models";

describe("Lawyers List:", () => {
  let server: Express;

  function mockListItemSome(resolvedValue = true): jest.SpyInstance {
    return jest.spyOn(listItem, "some").mockResolvedValue(resolvedValue);
  }

  beforeAll(async () => {
    mockListItemSome();
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
      expect(continueButton.text()).toBe("Continue");
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
        "Which country do you need a lawyer in?"
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

  describe("lawyer's region question page", () => {
    const pageLink = "/find?serviceType=lawyers&readNotice=ok&country=spain";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe(
        "Where in Spain do you need to find a lawyer?"
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
        "In which field of law do you need legal help?"
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

  describe("Lawyer's legal aid question page", () => {
    const pageLink =
      "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe("Are you interested in legal aid?");
      expect(continueButton.text()).toBe("Continue");
    });

    test("question is omitted for country without legal aid support", async () => {
      const { text } = await request(server)
        .get(
          "/find?serviceType=lawyers&readNotice=ok&country=thailand&region=bangkok&practiceArea=maritime,real%20estate"
        )
        .type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe(
        "Are you interested in pro bono services?"
      );
      expect(continueButton.text()).toBe("Continue");
    });

    test("POST request is correct", async () => {
      const { status, header } = await request(server)
        .post(pageLink)
        .send({ legalAid: "no" });

      expect(status).toBe(302);
      expect(header.location).toBe(`${pageLink}&legalAid=no`);
    });

    test("accessibility", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  describe("Lawyer's pro bono question page", () => {
    const pageLink =
      "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no";

    test("GET request is correct", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const $main = $html("main");
      const pageHeader = $main.find("h1");
      const continueButton = $main.find("button");

      expect(pageHeader.text().trim()).toBe(
        "Are you interested in pro bono services?"
      );
      expect(continueButton.text()).toBe("Continue");
    });

    test("POST request is correct", async () => {
      const { status, header } = await request(server)
        .post(pageLink)
        .send({ proBono: "no" });

      expect(status).toBe(302);
      expect(header.location).toBe(`${pageLink}&proBono=no`);
    });

    test("accessibility", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  describe("Lawyer's disclaimer question page", () => {
    const pageLink =
      "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no&proBono=no";

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
          "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no&proBono=no"
        )
        .type("text/html");

      expect(await axe(text)).toHaveNoViolations();
    });
  });

  test("Lawyer's final questionary page GET request is correct", async () => {
    // here the controller will check all parameters are correct and if so the user will be redirected to /results with the same query parameters
    const { status, header } = await request(server)
      .get(
        "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no&proBono=no&readDisclaimer=ok"
      )
      .type("text/html");

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/results?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no&proBono=no&readDisclaimer=ok"
    );
  });

  describe("Lawyers results page", () => {
    test("GET request answers box is correct", async () => {
      const { text } = await request(server)
        .get(
          "/results?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no&readDisclaimer=ok"
        )
        .type("text/html");

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
        "/find?serviceType=lawyers&readNotice=ok&region=madrid&practiceArea=maritime%2Creal%20estate&legalAid=no&readDisclaimer=ok"
      );

      // region answer
      expect(answers.eq(2).text()).toEqual(`
        Area
        Madrid
        Change
      `);
      expect(answers.eq(2).find("a").attr("href")).toEqual(
        "/find?serviceType=lawyers&readNotice=ok&country=spain&practiceArea=maritime%2Creal%20estate&legalAid=no&readDisclaimer=ok"
      );

      // legal practice areas
      expect(answers.eq(3).text()).toEqual(`
        Fields of law
        Maritime, Real Estate
        Change
      `);
      expect(answers.eq(3).find("a").attr("href")).toEqual(
        "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&legalAid=no&readDisclaimer=ok"
      );

      // legal aid
      expect(answers.eq(4).text()).toEqual(`
        Legal aid
        No
        Change
      `);
      expect(answers.eq(4).find("a").attr("href")).toEqual(
        "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime%2Creal%20estate&readDisclaimer=ok"
      );
    });

    test("accessibility", async () => {
      const { text } = await request(server)
        .get(
          "/results?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no&readDisclaimer=ok"
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
    expect(header.location).toBe(
      "https://www.gov.uk/government/publications/spain-list-of-lawyers"
    );
  });
});
