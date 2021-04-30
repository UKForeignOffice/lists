import { Express } from "express";
import proxy from "express-http-proxy";
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
        const data = proxyResData.toString("utf8");

        const updatedData = data
          .replaceAll(
            /(href|src)="\/([^'"]+)/g,
            `$1="${FORM_RUNNER_BASE_ROUTE}/$2"`
          )
          .replaceAll(
            /<form(.*)>/g,
            `<form $1 action="${userReq.originalUrl}">`
          );

        return updatedData;
      },
      userResHeaderDecorator(headers, _, userRes) {
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
