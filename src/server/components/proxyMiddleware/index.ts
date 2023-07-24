import type { Express } from "express";
import proxy from "express-http-proxy";
import { FORM_RUNNER_URL, isProd } from "server/config";

/**
 * Proxy middleware for the form runner
 * @param app Express app
 * Important: this middleware must be added before body and cookie parsers middlewares
 */
export function configureFormRunnerProxyMiddleware(server: Express): void {
  if (isProd) {
    server.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);
  } else {
    server.set("trust proxy", false);
  }

  server.use(
    `/application/*`,
    proxy(FORM_RUNNER_URL, {
      proxyReqPathResolver: function (req) {
        return req.originalUrl.replace("/application", "");
      },
      userResDecorator: function (_, proxyResData, userReq) {
        if (userReq.baseUrl.includes("assets/")) {
          return proxyResData;
        }
        return proxyResData.toString("utf8").replace(/(href|src|value)=('|")\/([^'"]+)/g, `$1=$2/application/$3`);
      },
      userResHeaderDecorator(headers, userReq, userRes) {
        const isApplicationRequest = userReq.originalUrl.startsWith("/application");
        if (userRes.statusCode === 302 && isApplicationRequest) {
          const prefix = headers.location?.startsWith("?view=") ? `/${userReq.params[0]}` : "";
          return {
            ...headers,
            location: headers.location?.startsWith("http")
              ? headers.location
              : `/application${prefix}${headers.location}`,
          };
        }

        return headers;
      },
    })
  );

  server.use(
    `/complain/*`,
    proxy(FORM_RUNNER_URL, {
      proxyReqPathResolver: function (req) {
        return req.originalUrl.replace("/complain", "");
      },
      userResDecorator: function (proxyRes, proxyResData, userReq) {
        if (userReq.baseUrl.includes("assets/")) {
          return proxyResData;
        }
        const FIND_PRIVACY_POLICY_URL =
          "https://www.gov.uk/government/publications/fcdo-privacy-notice-consular-services-in-the-uk-and-at-british-embassies-high-commissions-and-consulates-overseas?utm_source=CYB&utm_medium=FAP&utm_campaign=privacy";

        return proxyResData
          .toString("utf8")
          .replace("/help/privacy", `${FIND_PRIVACY_POLICY_URL}`)
          .replace(/(href|src|value)=('|")([^'"])(.*sitemap)[^'"]/g, `$1=/sitemap`)
          .replace(/(href|src|value)=('|")([^'"]*provider-contact([^'"])*)/g, `$1=$2/provider-complaint`)
          .replace(/(href|src|value)=('|")([^'"]*cookies([^'"])*)/g, `$1=$2/complain/help/cookies`)
          .replace(
            /(href|src|value)=(('|")(?!.*help|.*provider-contact|.*privacy|.*sitemap.*))\/([^'"]+)/g,
            `$1=$2/complain/$4`
          );
      },
      userResHeaderDecorator(headers, userReq, userRes) {
        const isComplainRequest = userReq.originalUrl.startsWith("/complain");

        if (userRes.statusCode === 302 && isComplainRequest) {
          const prefix = headers.location?.startsWith("?view=") ? `/${userReq.params[0]}` : "";
          return {
            ...headers,
            location: `/complain${prefix}${headers.location}`,
          };
        }

        return headers;
      },
    })
  );
}
