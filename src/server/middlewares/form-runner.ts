import { Express } from "express";
import proxy from "express-http-proxy";
import { listsRoutes } from "server/components/lists";
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

        const data = proxyResData.toString("utf8");
       
        return data
          .replace(
            /(href|src)=('|")\/([^'"]+)/g,
            `$1=$2${FORM_RUNNER_BASE_ROUTE}/$3`
          )
          .replace(/\/application\/help\/cookies/g, "/help/cookies")
          .replace(/<form (.*)>/g, `<form action="${userReq.originalUrl}" $1>`);
      },
      userResHeaderDecorator(headers, _, userRes) {
        if (userRes.statusCode === 302 && (headers.location?? "").includes("/feedback/status")) {
          // submission of feedback form was successful and form-runner is now redirecting user to the status page
          // but instead we are redirecting user to the lists feedback success page
          // this is necessary because form runner status page content is not ideal for feedback forms
          headers.location = listsRoutes.feedbackSuccess;
        } else if (userRes.statusCode === 302) {
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
