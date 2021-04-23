import request from "supertest";
import { Express } from "express";
import { spawn } from "child_process";
import proxy from "express-http-proxy";
import { logger } from "server/services/logger";

const FORM_RUNNER_BASE_ROUTE = "/application";
const FORM_RUNNER_URL = "localhost:3001";

let isStarting = false;

export async function startFormRunner(): Promise<boolean> {
  const isAlreadyRunning = await isFormRunnerReady();

  if (!isStarting && !isAlreadyRunning) {
    logger.info("Form Runner Starting");

    isStarting = true;
    const formRunner = spawn(`npm run form-runner:start`, { shell: true });

    formRunner.stdout.on("data", (data) => {
      logger.info("Form Runner Data: ", data.toString());
    });

    formRunner.stderr.on("data", (data) => {
      logger.error("Form Runner Error: ", data.toString());
    });

    formRunner.on("exit", () => {
      isStarting = false;
      logger.info("Form Runner Stopped");
    });

    process.once("SIGUSR2", function () {
      formRunner.kill();
    });

    process.on("SIGINT", () => {
      formRunner.kill();
    });
  }

  while (true) {
    const isReady = await isFormRunnerReady();

    if (isReady) {
      return true;
    }
  }
}

export async function isFormRunnerReady(): Promise<boolean> {
  try {
    const { status } = await request(FORM_RUNNER_URL).get("/status");
    return status === 200;
  } catch (error) {
    return false;
  }
}

export function configureFormRunner(server: Express): void {
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
