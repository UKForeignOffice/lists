import { Express } from "express";
import cookie from "cookie";
import proxy from "express-http-proxy";
import {
  FORM_RUNNER_BASE_ROUTE,
  FORM_RUNNER_URL,
} from "server/services/form-runner";
import { compact, map } from "lodash";

export function configureFormRunnerProxy(server: Express): void {
  server.use(
    `${FORM_RUNNER_BASE_ROUTE}/*`,
    proxy(FORM_RUNNER_URL, {
      proxyReqPathResolver: function (req) {
        return req.originalUrl.replace(`${FORM_RUNNER_BASE_ROUTE}`, "");
      },
      proxyReqOptDecorator: function (proxyReqOpts) {
        if (typeof proxyReqOpts?.headers?.cookie === "string") {
          // remove lists_* cookies because form-runner breaks with JSON cookies
          const cookies = cookie.parse(proxyReqOpts.headers.cookie);

          proxyReqOpts.headers.cookie = compact(
            map(cookies, (value, key) => {
              if (!key.startsWith("lists_")) {
                return cookie.serialize(key, value);
              }
            })
          ).join("; ");
        }

        return proxyReqOpts;
      },
      userResDecorator: function (_, proxyResData, userReq) {
        if (userReq.baseUrl.includes("assets/")) {
          return proxyResData;
        }

        const data = proxyResData.toString("utf8");

        const updatedData = data
          .replace(
            /(href|src)="\/([^'"]+)/g,
            `$1="${FORM_RUNNER_BASE_ROUTE}/$2`
          )
          .replace(/<form(.*)>/g, `<form $1 action="${userReq.originalUrl}">`);

        return updatedData;
      },
      userResHeaderDecorator(headers, _, userRes) {
        // adjust redirect location
        if (userRes.statusCode === 302) {
          return {
            ...headers,
            location: `${FORM_RUNNER_BASE_ROUTE}${headers.location}`,
          };
        }

        return headers;
      },
    })
  );
}
