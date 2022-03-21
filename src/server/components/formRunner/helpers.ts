import { set } from "lodash";
import request from "supertest";
import { spawn } from "child_process";
import { logger } from "server/services/logger";
import {
  FormRunnerComponent,
  FormRunnerField,
  FormRunnerNewSessionData,
  FormRunnerPage,
  FormRunnerQuestion,
  FormRunnerWebhookData
} from "./types";
import { FORM_RUNNER_URL } from "./constants";
import path from "path";
import fs from "fs";
import { FORM_RUNNER_SAFELIST, isLocalHost, SERVICE_DOMAIN } from "server/config";


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

    const formRunner = spawn(
      `NODE_CONFIG='{"safelist":["${FORM_RUNNER_SAFELIST}"]}' PRIVACY_POLICY_URL='' npm run form-runner:start`,
      {
        shell: true
      }
    );

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

export function getNewSessionWebhookData(listType: string, listItemId: string, questions: Array<Partial<FormRunnerQuestion>> | undefined, message: string): FormRunnerNewSessionData {
  const protocol = isLocalHost ? "http" : "https";
  const callbackUrl = `${protocol}://${SERVICE_DOMAIN}/ingest/${listType}/${listItemId}`;
  const redirectPath = `/summary`;
  const options = {
    message,
    callbackUrl,
    redirectPath
  };

  const newSessionData: FormRunnerNewSessionData = {
    questions,
    options,
    name: "Changes required"
  };
  return newSessionData;
}


export async function parseJsonFormData(listType: string, isUnderTest?: boolean): Promise<Array<Partial<FormRunnerQuestion>>> {

  const formsJsonFile = (isUnderTest === true) ? `/forms-json/${listType}.json` : `../src/server/components/formRunner/forms-json/${listType}.json`;
  const fileContents = await fs.promises.readFile(path.join(__dirname, formsJsonFile), "utf8");

  const formJsonData = JSON.parse(fileContents);
  const questions: Array<Partial<FormRunnerQuestion>> = formJsonData.pages
    .map((page: FormRunnerPage) => {
      const fields: FormRunnerField[] | undefined = page.components
        ?.filter((component: FormRunnerComponent) => component.type !== "Html")
        ?.map((component: FormRunnerComponent) => {
          const field: FormRunnerField = {
            answer: "",
            key: component.name,
            title: "",
          };

          return field;
        });
      return {
        fields: fields,
        question: page.title
      };
    })
    .filter((question: FormRunnerQuestion) => question.fields.length > 0);

  return questions;
}
