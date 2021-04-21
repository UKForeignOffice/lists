import { Express } from "express";
import { spawn } from "child_process";
import proxy from "express-http-proxy";
import { logger } from "server/services/logger";

const FORM_RUNNER_BASE_ROUTE = "application";
const FORM_RUNNER_URL = "localhost:3001";

let formRunnerStarted = false;

export function startFormRunner(): void {
  const formRunner = spawn(`npm run form-runner:start`, { shell: true });

  formRunner.stdout.on("data", (data) => {
    const hasStarted = data.toString().indexOf("/{id}/{path*}") > -1;

    if (hasStarted) {
      formRunnerStarted = true;
      logger.info("Form Runner Started");
    }
  });

  formRunner.stderr.on("data", (data) => {
    logger.error("From Runner Error: ", data.toString());
  });

  formRunner.on("exit", () => {
    formRunnerStarted = false;
    logger.info("Form Runner Stopped");
    startFormRunner();
  });

  process.once("SIGUSR2", function () {
    formRunner.kill("SIGINT");
  });
}

export function isFormRunnerReady(): boolean {
  return formRunnerStarted;
}

export function configureFormRunner(server: Express): void {
  server.use(
    `/${FORM_RUNNER_BASE_ROUTE}/*?`,
    proxy(FORM_RUNNER_URL, {
      proxyReqPathResolver: function (req) {
        const parts = req.originalUrl.split("?");
        const queryString = parts[1] ?? "";
        const updatedPath = parts[0].replace(`/${FORM_RUNNER_BASE_ROUTE}`, "");
        return updatedPath + (queryString.length > 0 ? "?" + queryString : "");
      },
      userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
        const data = proxyResData.toString("utf8");

        const updatedData = data
          .replaceAll(
            /(href|src)="\/([^'"]+)/g,
            `$1="/${FORM_RUNNER_BASE_ROUTE}/$2"`
          )
          .replaceAll(
            /<form(.*)>/g,
            `<form $1 action="${userReq.originalUrl}">`
          );

        return updatedData;
      },
      userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
        if (userRes.statusCode === 302) {
          return {
            ...headers,
            location: `/${FORM_RUNNER_BASE_ROUTE}${headers.location}`,
          };
        }

        return headers;
      },
    })
  );
}
