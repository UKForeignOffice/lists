import { set } from "lodash";
import request from "supertest";
import { spawn } from "child_process";
import { logger } from "server/services/logger";
import { FormRunnerWebhookData } from "./types";
import { FORM_RUNNER_URL } from "./constants";

let isStarting = false;

export async function isFormRunnerReady(): Promise<boolean> {
  try {
    const { status } = await request(FORM_RUNNER_URL).get("/health-check");
    return status === 200;
  } catch (error) {
    return false;
  }
}

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

    formRunner.stdout.on("data", (data) => {
      logger.info(`Form Runner stdout: ${data.toString()}`);
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
      logger.info("Form Runner Started");
      return true;
    }
  }
}

export function parseFormRunnerWebhookObject<T>({
  questions,
}: FormRunnerWebhookData): T {
  return questions.reduce((acc, question) => {
    const { fields, category } = question;

    fields.forEach((field) => {
      const { key, answer } = field;
      set(
        acc,
        `${category !== undefined ? `${category}.` : ""}${key}`,
        typeof answer === "string" ? answer.trim() : answer
      );
    });

    return acc;
  }, {}) as T;
}

export const successPageContent = `
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      <div class="govuk-panel govuk-panel--confirmation">
        <h1 class="govuk-panel__title">
          Check your email
        </h1>
      </div>

      <p class="govuk-body">We have sent you an email containing a link. You must use the link so that we can verify your email address.</p>

      <div class="govuk-warning-text">
        <span class="govuk-warning-text__icon" aria-hidden="true">!</span>
        <strong class="govuk-warning-text__text">
          <span class="govuk-warning-text__assistive">Warning</span>
          We cannot process your application unless you use the link.
        </strong>
      </div>
    </div>
  </div>
`;
