import request from "supertest";
import $ from "cheerio";
import { server } from "..";

describe("Location service:", () => {
  test("lawyer's land page GET request is correct", async () => {
    const { text } = await request(server)
      .get("/find?serviceType=lawyers")
      .type("text/html");

    const $html = $.load(text);
    const pageHeader = $html("h1");
    const continueButton = $html("button");

    expect(pageHeader.text().trim()).toBe("Find a lawyer abroad");
    expect(continueButton.text()).toBe("Continue");
  });

  test("lawyer's land page POST request is correct", async () => {
    const { status, header } = await request(server)
      .post("/find?serviceType=lawyers")
      .send({ readNotice: "ok" });

    expect(status).toBe(302);
    expect(header.location).toBe("/find?serviceType=lawyers&readNotice=ok");
  });

  test("lawyer's country question page GET request is correct", async () => {
    const { text } = await request(server)
      .get("/find?serviceType=lawyers&readNotice=ok")
      .type("text/html");

    const $html = $.load(text);
    const pageHeader = $html("h1");
    const continueButton = $html("button");

    expect(pageHeader.text().trim()).toBe(
      "Which country do you need a lawyer from?"
    );
    expect(continueButton.text()).toBe("Continue");
  });

  test("lawyer's country question page POST request is correct", async () => {
    const { status, header } = await request(server)
      .post("/find?serviceType=lawyers&readNotice=ok")
      .send({ country: "thailand" });

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/find?serviceType=lawyers&readNotice=ok&country=thailand"
    );
  });

  test("lawyer's region question page GET request is correct", async () => {
    const { text } = await request(server)
      .get("/find?serviceType=lawyers&readNotice=ok&country=thailand")
      .type("text/html");

    const $html = $.load(text);
    const pageHeader = $html("h1");
    const continueButton = $html("button");

    expect(pageHeader.text().trim()).toBe(
      "Which region in Thailand do you need a lawyer from?"
    );
    expect(continueButton.text()).toBe("Continue");
  });

  test("lawyer's region question page POST request is correct", async () => {
    const { status, header } = await request(server)
      .post("/find?serviceType=lawyers&readNotice=ok&country=thailand")
      .send({ region: "Bangkok" });

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/find?serviceType=lawyers&readNotice=ok&country=thailand&region=Bangkok"
    );
  });

  test("Lawyer's legal areas question page GET request is correct", async () => {
    const { text } = await request(server)
      .get(
        "/find?serviceType=lawyers&readNotice=ok&country=thailand&region=Bangkok"
      )
      .type("text/html");

    const $html = $.load(text);
    const pageHeader = $html("h1");
    const continueButton = $html("button");

    expect(pageHeader.text().trim()).toBe(
      "In which areas do you need legal help?"
    );
    expect(continueButton.text()).toBe("Continue");
  });

  test("Lawyer's legal areas question page POST request is correct", async () => {
    const { status, header } = await request(server)
      .post(
        "/find?serviceType=lawyers&readNotice=ok&country=thailand&region=Bangkok"
      )
      .send({ practiceArea: ["maritime", "real estate"] });

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/find?serviceType=lawyers&readNotice=ok&country=thailand&region=Bangkok&practiceArea=maritime,real%20estate"
    );
  });

  test("Lawyer's legal aid question page GET request is correct", async () => {
    const { text } = await request(server)
      .get(
        "/find?serviceType=lawyers&readNotice=ok&country=thailand&region=Bangkok&practiceArea=maritime,real%20estate"
      )
      .type("text/html");

    const $html = $.load(text);
    const pageHeader = $html("h1");
    const continueButton = $html("button");

    expect(pageHeader.text().trim()).toBe("Do you need legal aid?");
    expect(continueButton.text()).toBe("Continue");
  });

  test("Lawyer's legal aid question page POST request is correct", async () => {
    const { status, header } = await request(server)
      .post(
        "/find?serviceType=lawyers&readNotice=ok&country=thailand&region=Bangkok&practiceArea=maritime,real%20estate"
      )
      .send({ legalAid: "no" });

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/find?serviceType=lawyers&readNotice=ok&country=thailand&region=Bangkok&practiceArea=maritime,real%20estate&legalAid=no"
    );
  });

  test("Lawyer's disclaimer question page GET request is correct", async () => {
    const { text } = await request(server)
      .get(
        "/find?serviceType=lawyers&readNotice=ok&country=thailand&region=Bangkok&practiceArea=maritime,real%20estate&legalAid=no"
      )
      .type("text/html");

    const $html = $.load(text);
    const pageHeader = $html("h1");
    const continueButton = $html("button");

    expect(pageHeader.text().trim()).toBe("Disclaimer");
    expect(continueButton.text()).toBe("Continue");
  });

  test("Lawyer's disclaimer question page POST request is correct", async () => {
    const { status, header } = await request(server)
      .post(
        "/find?serviceType=lawyers&readNotice=ok&country=thailand&region=Bangkok&practiceArea=maritime,real%20estate&legalAid=no"
      )
      .send({ readDisclaimer: "ok" });

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/find?serviceType=lawyers&readNotice=ok&country=thailand&region=Bangkok&practiceArea=maritime,real%20estate&legalAid=no&readDisclaimer=ok"
    );
  });

  // test("Lawyer's results page GET request is correct");
});
