import $ from "cheerio";
import request from "supertest";
import { server } from "..";

describe("Lawyers List:", () => {
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
      .send({ country: "spain" });

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/find?serviceType=lawyers&readNotice=ok&country=spain"
    );
  });

  test("lawyer's region question page GET request is correct", async () => {
    const { text } = await request(server)
      .get("/find?serviceType=lawyers&readNotice=ok&country=spain")
      .type("text/html");

    const $html = $.load(text);
    const pageHeader = $html("h1");
    const continueButton = $html("button");

    expect(pageHeader.text().trim()).toBe(
      "Which area in Spain do you need a lawyer from?"
    );
    expect(continueButton.text()).toBe("Continue");
  });

  test("lawyer's region question page POST request is correct", async () => {
    const { status, header } = await request(server)
      .post("/find?serviceType=lawyers&readNotice=ok&country=spain")
      .send({ region: "madrid" });

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid"
    );
  });

  test("Lawyer's legal areas question page GET request is correct", async () => {
    const { text } = await request(server)
      .get(
        "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid"
      )
      .type("text/html");

    const $html = $.load(text);
    const pageHeader = $html("h1");
    const continueButton = $html("button");

    expect(pageHeader.text().trim()).toBe(
      "In which field of law do you need legal help?"
    );
    expect(continueButton.text()).toBe("Continue");
  });

  test("Lawyer's legal areas question page POST request is correct", async () => {
    const { status, header } = await request(server)
      .post(
        "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid"
      )
      .send({ practiceArea: ["maritime", "real estate"] });

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate"
    );
  });

  test("Lawyer's legal aid question page GET request is correct", async () => {
    const { text } = await request(server)
      .get(
        "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate"
      )
      .type("text/html");

    const $html = $.load(text);
    const pageHeader = $html("h1");
    const continueButton = $html("button");

    expect(pageHeader.text().trim()).toBe("Are you interested in legal aid?");
    expect(continueButton.text()).toBe("Continue");
  });

  test("Lawyer's legal aid question is omitted for country without legal aid support", async () => {
    const { text } = await request(server)
      .get(
        "/find?serviceType=lawyers&readNotice=ok&country=thailand&region=bangkok&practiceArea=maritime,real%20estate"
      )
      .type("text/html");

    const $html = $.load(text);
    const pageHeader = $html("h1");
    const continueButton = $html("button");

    expect(pageHeader.text().trim()).toBe("Disclaimer");
    expect(continueButton.text()).toBe("Continue");
  });

  test("Lawyer's legal aid question page POST request is correct", async () => {
    const { status, header } = await request(server)
      .post(
        "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate"
      )
      .send({ legalAid: "no" });

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no"
    );
  });

  test("Lawyer's disclaimer question page GET request is correct", async () => {
    const { text } = await request(server)
      .get(
        "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no"
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
        "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no"
      )
      .send({ readDisclaimer: "ok" });

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no&readDisclaimer=ok"
    );
  });

  test("Lawyer's final questionary page GET request is correct", async () => {
    // here the controller will check all parameters are correct and if so the user will be redirected to /results with the same query parameters
    const { status, header } = await request(server)
      .get(
        "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no&readDisclaimer=ok"
      )
      .type("text/html");

    expect(status).toBe(302);
    expect(header.location).toBe(
      "/results?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no&readDisclaimer=ok"
    );
  });

  test("Lawyers results page GET request answers box is correct", async () => {
    const { text } = await request(server)
      .get(
        "/results?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime,real%20estate&legalAid=no&readDisclaimer=ok"
      )
      .type("text/html");

    const $html = $.load(text);
    const $body = $html("body");
    const $answerBox = $($body.find(".answers-box"));

    const answers = $answerBox.find("p");

    // country answer
    expect(answers.eq(1).text()).toEqual(`
        Country?
        Spain
        Change
      `);

    expect(answers.eq(1).find("a").attr("href")).toEqual(
      "/find?serviceType=lawyers&readNotice=ok&region=madrid&practiceArea=maritime%2Creal%20estate&legalAid=no&readDisclaimer=ok"
    );

    // region answer
    expect(answers.eq(2).text()).toEqual(`
        Area?
        Madrid
        Change
      `);
    expect(answers.eq(2).find("a").attr("href")).toEqual(
      "/find?serviceType=lawyers&readNotice=ok&country=spain&practiceArea=maritime%2Creal%20estate&legalAid=no&readDisclaimer=ok"
    );

    // legal practice areas
    expect(answers.eq(3).text()).toEqual(`
        Which field of law do you need?
        Maritime, Real Estate
        Change
      `);
    expect(answers.eq(3).find("a").attr("href")).toEqual(
      "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&legalAid=no&readDisclaimer=ok"
    );

    // legal aid
    expect(answers.eq(4).text()).toEqual(`
        Are you interested in legal aid?
        No
        Change
      `);
    expect(answers.eq(4).find("a").attr("href")).toEqual(
      "/find?serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime%2Creal%20estate&readDisclaimer=ok"
    );
  });
});
