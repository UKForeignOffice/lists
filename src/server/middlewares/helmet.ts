import { Express } from "express";
import { IncomingMessage, ServerResponse } from "http";
import { get } from "lodash";
import helmet from "helmet";
import crypto from "crypto";
import { SERVICE_DOMAIN } from "server/config";

const TRUSTED = ["'self'", `${SERVICE_DOMAIN}`];

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
    const nonce = crypto.randomBytes(16).toString("hex");
    res.locals.cspNonce = nonce;
    next();
  });

  const generateCspNonce = (
    _req: IncomingMessage,
    res: ServerResponse
  ): string => {
    return `'nonce-${get(res, "locals.cspNonce")}'`;
  };

  server.use(
    helmet({
      referrerPolicy: { policy: "no-referrer" },
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: [
            ...TRUSTED,
            ...GOVUK_DOMAINS,
            ...GOOGLE_ANALYTICS_DOMAINS,
          ],
          "script-src": [
            ...TRUSTED,
            ...GOVUK_DOMAINS,
            ...GOOGLE_ANALYTICS_DOMAINS,
            ...GOOGLE_STATIC_DOMAINS,
            generateCspNonce,
          ],
          "style-src": [...TRUSTED, ...GOVUK_DOMAINS],
        },
      },
    })
  );
}
