import $ from "cheerio";
import { Express } from "express";
import request from "supertest";
import { getServer } from "../server";
import { SERVICE_NAME } from "server/config";
import { capitalize } from "lodash";

describe("Cookies", () => {
  const pageLink = "/find?serviceType=lawyers";
  let server: Express;

  beforeAll(async () => {
    server = await getServer();
  }, 30000);

  describe("Cookies routes", () => {
    test("get /help/cookies is responding correctly", async () => {
      const { text, status } = await request(server)
        .get("/help/cookies")
        .type("text/html");
      expect(status).toEqual(200);
      expect(
        text.includes(`Cookies on ${capitalize(process.env.SERVICE_NAME)}`)
      ).toBe(true);
    });

    test("post /help/cookies is responding correctly", async () => {
      const { text, status } = await request(server)
        .post("/help/cookies")
        .type("text/html");
      expect(status).toEqual(200);
      expect(text.includes(`Your cookie settings were saved`)).toBe(true);
    });
  });

  describe("Banner without JS", () => {
    test("it renders no-javascript banner correctly", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const cookieBanner = $html(".govuk-cookie-banner").eq(1);
      const cookiePageLink = cookieBanner.find("a");

      expect(
        cookieBanner.text().includes(`Cookies on ${capitalize(SERVICE_NAME)}`)
      ).toBe(true);
      expect(
        cookieBanner
          .text()
          .includes(
            "We use cookies to make this service work and collect analytics information. To accept or reject cookies, please visit our cookies page."
          )
      ).toBe(true);
      expect(cookiePageLink.attr("href")).toBe("/help/cookies");
    });
  });

  describe("Banner with JS", () => {
    test("it renders javascript banner correctly", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);

      const cookieBanner = $html(".govuk-cookie-banner").first();
      const acceptButton = cookieBanner.find("button").eq(0);
      const rejectButton = cookieBanner.find("button").eq(1);

      expect(
        cookieBanner.text().includes(`Cookies on ${capitalize(SERVICE_NAME)}`)
      ).toBe(true);
      expect(acceptButton.text().trim()).toEqual("Accept analytics cookies");
      expect(rejectButton.text().trim()).toEqual("Reject analytics cookies");
    });
  });

  describe("Cookies Page", () => {
    const pageLink = "/help/cookies";

    test("it renders correctly", async () => {
      const { text } = await request(server).get(pageLink).type("text/html");

      const $html = $.load(text);
      const main = $html("main");
      const radios = $html(":radio");
      const pageText = main.text();

      expect(pageText.includes("Cookies")).toBe(true);
      expect(pageText.includes("We use 2 types of cookie.")).toBe(true);
      expect(pageText.includes("Use cookies that measure my website use")).toBe(
        true
      );
      expect(
        pageText.includes("Do not use cookies that measure my website use")
      ).toBe(true);
      expect(radios.length).toBe(2);
    });

    test("accept analytics works correctly", async () => {
      const { text } = await request(server)
        .post(pageLink)
        .type("form")
        .send({ analytics: "on" });

      const $html = $.load(text);
      const radios = $html(":radio");
      const successBanner = $html(".govuk-notification-banner");

      expect(successBanner.length).toBe(1);
      expect(radios.eq(0).attr("name")).toBe("analytics");
      expect(radios.eq(0).attr("checked")).toBe("checked");
      expect(radios.eq(0).attr("value")).toBe("on");

      expect(radios.eq(1).attr("name")).toBe("analytics");
      expect(radios.eq(1).attr("checked")).toBe(undefined);
      expect(radios.eq(1).attr("value")).toBe("off");
    });

    test("reject analytics works correctly", async () => {
      const { text, headers } = await request(server)
        .post(pageLink)
        .type("form")
        .send({ analytics: "off" });

      const $html = $.load(text);
      const radios = $html(":radio");
      const successBanner = $html(".govuk-notification-banner");

      const cookiesPolicy = headers["set-cookie"]
        .find((elm: string) => elm?.includes("cookies_policy"))
        .split("=")[1]
        .split(";")[0]
        .trim();

      expect(successBanner.length).toBe(1);
      expect(cookiesPolicy).toEqual(
        Buffer.from(
          JSON.stringify({
            isSet: true,
            essential: true,
            analytics: "off",
            usage: false,
          })
        ).toString("base64")
      );

      expect(radios.eq(0).attr("name")).toBe("analytics");
      expect(radios.eq(0).attr("checked")).toBe(undefined);
      expect(radios.eq(0).attr("value")).toBe("on");

      expect(radios.eq(1).attr("name")).toBe("analytics");
      expect(radios.eq(1).attr("checked")).toBe("checked");
      expect(radios.eq(1).attr("value")).toBe("off");
    });
  });
});
