import { set } from "lodash";
import request from "supertest";
import { spawn } from "child_process";
import { logger } from "server/services/logger";
import { FormRunnerWebhookData } from "./types";

export const FORM_RUNNER_BASE_ROUTE = "/application";
export const FORM_RUNNER_URL = "localhost:3001";

let isStarting = false;

export async function startFormRunner(): Promise<boolean> {
  const isAlreadyRunning = await isFormRunnerReady();

  if (!isStarting && !isAlreadyRunning) {
    logger.info("Form Runner Starting");

    isStarting = true;
    const formRunner = spawn(`npm run form-runner:start`, {
      shell: true,
    });

    formRunner.stderr.on("data", (data) => {
      logger.error(`Form Runner Error: ${data.toString()}`);
    });

    formRunner.on("exit", (code, signal) => {
      isStarting = false;
      logger.info(`Form Runner Stopped: Code:${code}, Signal: ${signal}`);
    });

    process.once("SIGUSR2", function () {
      isStarting = false;
      formRunner.kill();
    });

    process.on("SIGINT", () => {
      isStarting = false;
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
    const { status } = await request(FORM_RUNNER_URL).get("/health-check");
    return status === 200;
  } catch (error) {
    return false;
  }
}

export function parseFormRunnerWebhookObject<T>({
  questions,
}: FormRunnerWebhookData): T {
  return questions.reduce((acc, question) => {
    const { fields, category } = question;

    fields.forEach((field) => {
      const { key, answer } = field;
      set(acc, `${category !== undefined ? `${category}.` : ""}${key}`, answer);
    });

    return acc;
  }, {}) as T;
}
