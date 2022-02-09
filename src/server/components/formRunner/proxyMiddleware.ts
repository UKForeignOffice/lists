import { Express } from "express";
import proxy from "express-http-proxy";
import { FORM_RUNNER_BASE_ROUTE, FORM_RUNNER_URL } from "./constants";

/**
 * Proxy middleware for the form runner
 * @param app Express app
 * Important: this middleware must be added before body and cookie parsers middlewares
 */
export function configureFormRunnerProxyMiddleware(server: Express): void {
  server.use(
    `${FORM_RUNNER_BASE_ROUTE}/*`,
    proxy(FORM_RUNNER_URL, {
      proxyReqPathResolver: function (req) {
        return req.originalUrl.replace(FORM_RUNNER_BASE_ROUTE, "");
      },
      userResDecorator: function (_, proxyResData, userReq) {
        if (userReq.baseUrl.includes("assets/")) {
          return proxyResData;
        }

        return proxyResData
          .toString("utf8")
          .replace(
            /(href|src|value)=('|")\/([^'"]+)/g,
            `$1=$2${FORM_RUNNER_BASE_ROUTE}/$3`
          )
          .replace(/\/application\/help\/cookies/g, "/help/cookies")
          .replace(
            /\/application\/help\/accessibility-statement/g,
            "/help/accessibility-statement"
          );
      },
      userResHeaderDecorator(headers, _userReq, userRes) {
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
