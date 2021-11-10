import { Express } from "express";
import proxy from "express-http-proxy";
import { FORM_RUNNER_BASE_ROUTE, FORM_RUNNER_URL } from "./constants";
import { getFeedbackSuccessContent } from "server/components/feedback/helpers";
import { successPageContent } from "./helpers";

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

        let data: string = proxyResData.toString("utf8");

        // TODO: Find a better way to do this.
        if (userReq.baseUrl.includes("/status")) {
          if (
            data.search("Sorry, there is a problem with the service") === -1
          ) {
            if (userReq.baseUrl.startsWith("/application/feedback")) {
              // replace content of status page for feedback form
              data = data.replace(
                /(<main .*>)((.|\n)*?)(<\/main>)/im,
                `$1${getFeedbackSuccessContent()}$4`
              );
            } else {
              data = data.replace(
                /(<main .*>)((.|\n)*?)(<\/main>)/im,
                `$1${successPageContent}$4`
              );
            }
          }
        }

        return data
          .replace(
            /(href|src|value)=('|")\/([^'"]+)/g,
            `$1=$2${FORM_RUNNER_BASE_ROUTE}/$3`
          )
          .replace(/\/application\/help\/cookies/g, "/help/cookies");
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
