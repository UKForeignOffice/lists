import { Express } from "express";
import proxy from "express-http-proxy";
import { getFeedbackSuccessContent } from "server/controllers/feedback/helpers";
import {
  FORM_RUNNER_BASE_ROUTE,
  FORM_RUNNER_URL,
} from "server/services/form-runner";

export function configureFormRunnerProxy(server: Express): void {
  server.use(
    `${FORM_RUNNER_BASE_ROUTE}/*`,
    proxy(FORM_RUNNER_URL, {
      proxyReqPathResolver: function (req) {
        return req.originalUrl.replace(`${FORM_RUNNER_BASE_ROUTE}`, "");
      },
      userResDecorator: function (_, proxyResData, userReq) {
        if (userReq.baseUrl.includes("assets/")) {
          return proxyResData;
        }

        let data = proxyResData.toString("utf8");
        
        if (userReq.baseUrl.includes("/feedback/status")) {
          // replace content of status page for feedback form
          data = data.replace(
            /(<main .*>)((.|\n)*?)(<\/main>)/im,
            `$1${getFeedbackSuccessContent()}$4`
          );
        }

        return data
          .replace(
            /(href|src)=('|")\/([^'"]+)/g,
            `$1=$2${FORM_RUNNER_BASE_ROUTE}/$3`
          )
          .replace(/\/application\/help\/cookies/g, "/help/cookies")
          .replace(/<form (.*)>/g, `<form action="${userReq.originalUrl}" $1>`);
      },
      userResHeaderDecorator(headers, userReq, userRes) {
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
