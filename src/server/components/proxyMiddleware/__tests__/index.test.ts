import express, { type Express } from "express";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import request from "supertest";
import { configureBodyParser } from "server/middlewares/body-parser";

jest.mock("../router", () => ({
  applyRouter: require("express").Router(),
}));

describe("form runner proxy middleware", () => {
  let app: Express;
  let upstream: Server;
  let upstreamUrl: string;
  let upstreamRequest: { method: string; url: string; body: Buffer } | undefined;
  const originalFormRunnerUrl = process.env.FORM_RUNNER_URL;

  beforeAll(async () => {
    upstream = createServer((incoming, outgoing) => {
      const chunks: Buffer[] = [];

      incoming.on("data", (chunk: Buffer | string) => {
        chunks.push(Buffer.from(chunk));
      });
      incoming.on("end", () => {
        const body = Buffer.concat(chunks);
        upstreamRequest = {
          method: incoming.method ?? "",
          url: incoming.url ?? "",
          body,
        };

        if (incoming.url?.startsWith("/redirect-relative")) {
          outgoing.writeHead(302, { location: "/next-step" }).end();
          return;
        }
        if (incoming.url?.startsWith("/redirect-absolute")) {
          outgoing.writeHead(302, { location: "https://forms.example/next-step" }).end();
          return;
        }
        if (incoming.url?.includes("/redirect-view")) {
          outgoing.writeHead(302, { location: "?view=details" }).end();
          return;
        }
        if (incoming.url === "/application-html") {
          outgoing
            .writeHead(200, { "content-type": "text/html" })
            .end('<a href="/forms/start">Form</a><a href="/sitemap">Sitemap</a>');
          return;
        }
        if (incoming.url === "/complain-html") {
          outgoing
            .writeHead(200, { "content-type": "text/html" })
            .end(
              '<a href="/help/privacy">Privacy</a><a href="/provider-contact">Contact</a><a href="/help/cookies">Cookies</a><a href="/sitemap">Sitemap</a><a href="/forms/start">Form</a>'
            );
          return;
        }
        if (incoming.url === "/assets/icon.bin") {
          outgoing.writeHead(200, { "content-type": "application/octet-stream" }).end(Buffer.from([0, 1, 2, 255]));
          return;
        }

        outgoing.writeHead(200, { "content-type": "text/plain" }).end(body.length > 0 ? body : "upstream");
      });
    });

    await new Promise<void>((resolve, reject) => {
      upstream.once("error", reject);
      upstream.listen(0, "127.0.0.1", resolve);
    });

    const address = upstream.address() as AddressInfo;
    upstreamUrl = `http://127.0.0.1:${address.port}`;
    process.env.FORM_RUNNER_URL = upstreamUrl;

    const { configureFormRunnerProxyMiddleware } = require("../index") as typeof import("../index");
    app = express();
    configureFormRunnerProxyMiddleware(app);
    configureBodyParser(app);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      upstream.close((error) => (error ? reject(error) : resolve()));
    });

    if (originalFormRunnerUrl === undefined) {
      delete process.env.FORM_RUNNER_URL;
    } else {
      process.env.FORM_RUNNER_URL = originalFormRunnerUrl;
    }
  });

  beforeEach(() => {
    upstreamRequest = undefined;
  });

  test.each([
    ["/application/forms/start?view=full&lang=en", "/forms/start?view=full&lang=en"],
    ["/complain/complaint/start?case=123", "/complaint/start?case=123"],
  ])("forwards %s to upstream path %s", async (url, expectedUpstreamPath) => {
    const response = await request(app).get(url);

    expect(response.status).toBe(200);
    expect(upstreamRequest?.url).toBe(expectedUpstreamPath);
  });

  test.each([
    ["/application/submit?draft=true", "/submit?draft=true"],
    ["/complain/submit?draft=true", "/submit?draft=true"],
  ])("forwards POST body on %s before body parsing", async (url, expectedUpstreamPath) => {
    const body = "answer=unchanged+body";

    const response = await request(app).post(url).type("application/x-www-form-urlencoded").send(body);

    expect(response.status).toBe(200);
    expect(upstreamRequest).toEqual({
      method: "POST",
      url: expectedUpstreamPath,
      body: Buffer.from(body),
    });
  });

  test("prefixes local redirects and leaves absolute application redirects unchanged", async () => {
    const relative = await request(app).get("/application/redirect-relative");
    const absolute = await request(app).get("/application/redirect-absolute");

    expect(relative.status).toBe(302);
    expect(relative.headers.location).toBe("/application/next-step");
    expect(absolute.status).toBe(302);
    expect(absolute.headers.location).toBe("https://forms.example/next-step");
  });

  test("preserves the application path for view redirects", async () => {
    const response = await request(app).get("/application/forms/redirect-view");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/application/forms/redirect-view?view=details");
  });

  test("prefixes local complain redirects", async () => {
    const response = await request(app).get("/complain/redirect-relative");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/complain/next-step");
  });

  test("rewrites application links and sitemap links in HTML responses", async () => {
    const response = await request(app).get("/application/application-html");

    expect(response.status).toBe(200);
    expect(response.text).toContain('href="/application/forms/start"');
    expect(response.text).toMatch(/href="\/(?:application\/)?sitemap"/);
  });

  test("rewrites complain privacy, provider contact, cookies, sitemap, and local links", async () => {
    const response = await request(app).get("/complain/complain-html");

    expect(response.status).toBe(200);
    expect(response.text).toContain(
      "https://www.gov.uk/government/publications/fcdo-privacy-notice-consular-services-in-the-uk-and-at-british-embassies-high-commissions-and-consulates-overseas?utm_source=CYB&utm_medium=FAP&utm_campaign=privacy"
    );
    expect(response.text).toContain('href="/provider-complaint"');
    expect(response.text).toContain('href="/complain/help/cookies"');
    expect(response.text).toContain('href="/sitemap"');
    expect(response.text).toContain('href="/complain/forms/start"');
  });

  test.each(["/application/assets/icon.bin", "/complain/assets/icon.bin"])(
    "passes binary assets through %s without text rewriting",
    async (url) => {
      const response = await request(app).get(url);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(Buffer.from([0, 1, 2, 255]));
    }
  );
});
