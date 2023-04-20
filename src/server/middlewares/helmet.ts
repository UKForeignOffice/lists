import type { Express } from "express";
import type { IncomingMessage, ServerResponse } from "http";
import { get, set } from "lodash";
import helmet from "helmet";
import crypto from "crypto";
import { isLocalHost, SERVICE_DOMAIN } from "server/config";

const TRUSTED = ["'self'", SERVICE_DOMAIN ?? ""];

const GOVUK_DOMAINS = ["*.publishing.service.gov.uk", "*.gov.uk", "www.gov.uk", "*.dev.gov.uk"];

const GOOGLE_ANALYTICS_DOMAINS = [
  "www.google-analytics.com",
  "ssl.google-analytics.com",
  "stats.g.doubleclick.net",
  "www.googletagmanager.com",
  "tagmanager.google.com",
];

const GOOGLE_STATIC_DOMAINS = ["www.gstatic.com", "ssl.gstatic.com"];

const GOOGLE_FONTS_DOMAINS = ["fonts.gstatic.com"];

const GOOGLE_STYLES_DOMAINS = ["fonts.googleapis.com"];

const DATA = ["data:"];

export function configureHelmet(server: Express): void {
  server.use((_req, res, next) => {
    const nonce = crypto.randomBytes(16).toString("base64");
    set(res, "locals.cspNonce", nonce);
    next();
  });

  const generateCspNonce = (_req: IncomingMessage, res: ServerResponse): string => {
    return `'nonce-${get(res, "locals.cspNonce")}'`;
  };

  server.use(helmet.frameguard({ action: "deny" }));
  server.use(helmet.referrerPolicy({ policy: "no-referrer" }));
  server.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        connectSrc: [TRUSTED[0], GOOGLE_ANALYTICS_DOMAINS[0]],
        defaultSrc: [...TRUSTED, ...GOVUK_DOMAINS, ...GOOGLE_ANALYTICS_DOMAINS],
        scriptSrc: [
          generateCspNonce,
          ...TRUSTED,
          ...GOVUK_DOMAINS,
          ...GOOGLE_ANALYTICS_DOMAINS,
          ...GOOGLE_STATIC_DOMAINS,
        ],
        styleSrc: [...TRUSTED, ...GOVUK_DOMAINS, GOOGLE_ANALYTICS_DOMAINS[4], ...GOOGLE_STYLES_DOMAINS],
        imgSrc: [
          ...TRUSTED,
          ...DATA,
          ...GOOGLE_STATIC_DOMAINS,
          GOOGLE_ANALYTICS_DOMAINS[3],
          GOOGLE_ANALYTICS_DOMAINS[0],
        ],
        fontSrc: [...TRUSTED, ...DATA, ...GOOGLE_FONTS_DOMAINS],
        frameSrc: [...TRUSTED, ...DATA, GOOGLE_ANALYTICS_DOMAINS[3]],
        "form-action": [...TRUSTED, ...GOVUK_DOMAINS],
        upgradeInsecureRequests: isLocalHost ? null : [], // Do not upgrade requests to HTTPS when running locally
      },
    })
  );
  server.use(helmet.hsts());
  server.use(helmet.noSniff());
  server.use(helmet.ieNoOpen());
  server.use(helmet.expectCt());
  server.use(helmet.xssFilter());
  server.use(helmet.hidePoweredBy());
  server.use(helmet.dnsPrefetchControl());
  server.use(helmet.permittedCrossDomainPolicies());
}
