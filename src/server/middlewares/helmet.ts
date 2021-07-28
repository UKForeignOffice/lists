import { Express } from "express";
import { IncomingMessage, ServerResponse } from "http";
import { get, set } from "lodash";
import helmet from "helmet";
import crypto from "crypto";
import { SERVICE_DOMAIN } from "server/config";

const TRUSTED = ["self", `${SERVICE_DOMAIN}`];

const GOVUK_DOMAINS = [
  "*.publishing.service.gov.uk",
  "*.gov.uk",
  "www.gov.uk",
  "*.dev.gov.uk",
];

const GOOGLE_ANALYTICS_DOMAINS = [
  "www.google-analytics.com",
  "ssl.google-analytics.com",
  "stats.g.doubleclick.net",
  "www.googletagmanager.com",
];

const GOOGLE_STATIC_DOMAINS = ["www.gstatic.com"];

export function configureHelmet(server: Express): void {
  server.use((_req, res, next) => {
    const nonce = crypto.randomBytes(8).toString("hex");
    set(res, "locals.cspNonce", nonce);
    next();
  });

  const generateCspNonce = (
    _req: IncomingMessage,
    res: ServerResponse
  ): string => {
    return `'nonce-${get(res, "locals.cspNonce")}'`;
  };

  server.use(helmet.frameguard({ action: "deny" }));
  server.use(helmet.referrerPolicy({ policy: "no-referrer" }));
  server.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        defaultSrc: [...TRUSTED, ...GOVUK_DOMAINS, ...GOOGLE_ANALYTICS_DOMAINS],
        "script-src": [
          ...TRUSTED,
          ...GOVUK_DOMAINS,
          ...GOOGLE_ANALYTICS_DOMAINS,
          ...GOOGLE_STATIC_DOMAINS,
          generateCspNonce,
        ],
        "style-src": [...TRUSTED, ...GOVUK_DOMAINS],
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
