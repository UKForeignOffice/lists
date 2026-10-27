import path from "path";
import express from "express";
import nunjucks from "nunjucks";
import request from "supertest";
import { configureStaticServer } from "../middlewares/static";

const viewsPath = path.resolve(__dirname, "../views");
const govukFrontendPath = path.resolve(process.cwd(), "node_modules/govuk-frontend/dist/govuk");
const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader([viewsPath, govukFrontendPath, path.join(govukFrontendPath, "components")]),
  { autoescape: true }
);

describe("GOV.UK Frontend v6 migration", () => {
  test("renders the v6 branding assets inside semantic header and footer elements", () => {
    const html = env.render("template.njk", { assetPath: "/assets", themeColor: "#1d70b8" });

    expect(html).toContain('<html lang="en" class="govuk-template">');
    expect(html).toContain('<meta name="theme-color" content="#1d70b8">');
    expect(html).toContain('<link rel="icon" sizes="48x48" href="/assets/images/favicon.ico">');
    expect(html).toContain('<link rel="icon" sizes="any" href="/assets/images/favicon.svg" type="image/svg+xml">');
    expect(html).toContain('<link rel="mask-icon" href="/assets/images/govuk-icon-mask.svg" color="#1d70b8">');
    expect(html).toContain('<link rel="apple-touch-icon" href="/assets/images/govuk-icon-180.png">');
    expect(html).toContain('<link rel="manifest" href="/assets/manifest.json">');
    expect(html).toMatch(/<header class="govuk-template__header">[\s\S]*?<div class="govuk-header"/);
    expect(html).toMatch(/<footer class="govuk-template__footer">[\s\S]*?<div class="govuk-footer"/);
    expect(html).not.toContain("rebrand");
    expect(html).not.toContain("govuk-apple-touch-icon");
    expect(html).not.toContain("govuk-mask-icon.svg");

    const applyFooter = env.render("apply/apply-footer.njk");
    expect(applyFooter).toMatch(/<footer class="govuk-template__footer">[\s\S]*?<div class="govuk-footer"/);
  });

  test("renders one CSP-nonced GOV.UK Frontend module import", () => {
    const html = env.render("layout.njk", {
      cspNonce: "test-csp-nonce",
      SERVICE_NAME: "Lists",
      SERVICE_DOMAIN: "localhost:3000",
      req: { user: { isAdministrator: false } },
    });

    expect(
      html.match(/import\s+\{\s*initAll\s*\}\s+from\s+'\/assets\/govuk-frontend\/govuk-frontend\.min\.js'/g)
    ).toHaveLength(1);
    expect(html).toContain('<script type="module" nonce="test-csp-nonce">');
    expect(html).toContain("initAll()");
    expect(html).not.toContain('type="module" nonce="test-csp-nonce" src=');
    expect(html).toContain('<script type="text/javascript" src="/assets/main.js" nonce="test-csp-nonce"></script>');
    expect(html).toContain('class="govuk-header__homepage-link"');
    expect(html).toMatch(/<header class="govuk-template__header">[\s\S]*?<div class="govuk-header"/);
    expect(html).not.toContain("govuk-header__navigation");
  });

  test("renders dashboard navigation links and conditionally includes Admins", () => {
    const navigationFor = (isAdministrator: boolean) =>
      env.render("dashboard/dashboard.njk", {
        SERVICE_DOMAIN: "localhost:3000",
        SERVICE_NAME: "Lists",
        req: { user: { isAdministrator } },
      });

    const regularUserNavigation = navigationFor(false);
    expect(regularUserNavigation).toContain('href="/dashboard/lists"');
    expect(regularUserNavigation).toContain('href="/dashboard/help"');
    expect(regularUserNavigation).toContain('href="/logout"');
    expect(regularUserNavigation).not.toContain('href="/dashboard/users"');

    const administratorNavigation = navigationFor(true);
    expect(administratorNavigation).toContain('href="/dashboard/users"');
    expect(administratorNavigation).toContain("Admins");

    expect(regularUserNavigation).toContain(
      'class="govuk-service-navigation__toggle govuk-js-service-navigation-toggle"'
    );
    expect(regularUserNavigation).toContain('data-module="govuk-service-navigation"');
  });

  test("serves the GOV.UK Frontend module and branding assets referenced by the template", async () => {
    const app = express();
    configureStaticServer(app);

    const resources = [
      { url: "/assets/govuk-frontend/govuk-frontend.min.js", contentType: /javascript/ },
      { url: "/assets/images/favicon.svg", contentType: /svg/ },
      { url: "/assets/manifest.json", contentType: /json/ },
    ];

    for (const { url, contentType } of resources) {
      const response = await request(app).get(url).expect(200);
      expect(response.headers["content-type"]).toMatch(contentType);
      expect(response.body.length || response.text.length).toBeGreaterThan(0);
    }
  });
});
