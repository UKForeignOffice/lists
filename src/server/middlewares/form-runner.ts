import { spawn } from "child_process";
import { Express } from "express";
import proxy from "express-http-proxy";
import { logger } from "server/services/logger";

let formRunnerStarted = false;

const FORMS_BASE_ROUTE = "application";

function startFormRunner(): void {
  const formRunner = spawn(`npm run form-builder:start`, { shell: true });

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
    logger.info("Form Runner Stopped");
    startFormRunner();
  });

  process.once("SIGUSR2", function () {
    formRunner.kill("SIGINT");
  });
}

export function configureFormRunnerProxy(server: Express): void {
  startFormRunner();

  server.use(
    `/${FORMS_BASE_ROUTE}/*?`,
    proxy("localhost:3001", {
      proxyReqPathResolver: function (req) {
        const parts = req.originalUrl.split("?");
        const queryString = parts[1] ?? "";
        const updatedPath = parts[0].replace(`/${FORMS_BASE_ROUTE}`, "");
        return updatedPath + (queryString.length > 0 ? "?" + queryString : "");
      },
      userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
        const data = proxyResData.toString("utf8");

        const updatedData = data
          .replaceAll(/(href|src)="\/([^'"]+)/g, `$1="/${FORMS_BASE_ROUTE}/$2"`)
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
            location: `/${FORMS_BASE_ROUTE}${headers.location}`,
          };
        }

        return headers;
      },
    })
  );
}

export function isFormRunnerReady(): boolean {
  return formRunnerStarted;
}
