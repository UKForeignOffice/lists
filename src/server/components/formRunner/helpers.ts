import request from "supertest";
import { spawn } from "child_process";
import { logger } from "server/services/logger";
import * as FormRunner from "./types";
import { FORM_RUNNER_URL } from "./constants";
import path from "path";
import fs from "fs";
import {
  LawyerListItemGetObject,
  List,
  BaseListItemGetObject,
  ServiceType,
} from "server/models/types";
import * as lawyers from "./lawyers";

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
  // if (!isStarting && !isAlreadyRunning) {
  //   logger.info("Form Runner Starting");

  //   isStarting = true;

    // const formRunner = spawn(
    //   `NODE_CONFIG='{"safelist":["${FORM_RUNNER_SAFELIST?.split(",")?.join(
    //     '","'
    //   )}"]}' PRIVACY_POLICY_URL='' npm run form-runner:start`,
    //   {
    //     shell: true,
    //   }
    // );
    //
    // const formRunner = spawn(`npm run form-runner:start`, {
    //   shell: true,
    // });

  //   formRunner.stderr.on("data", (data) => {
  //     logger.error(`Form Runner Error: ${data.toString()}`);
  //   });

  //   formRunner.stdout.on("data", (data) => {
  //     logger.info(`Form Runner stdout: ${data.toString()}`);
  //   });

  //   formRunner.on("exit", (code, signal) => {
  //     isStarting = false;
  //     logger.info(`Form Runner Stopped: Code:${code}, Signal: ${signal}`);
  //   });

  //   process.once("SIGUSR2", function () {
  //     isStarting = false;
  //     formRunner.kill();
  //   });

  //   process.on("SIGINT", () => {
  //     isStarting = false;
  //     formRunner.kill();
  //   });
  // }

  // while (true) {
  //   const isReady = await isFormRunnerReady();

  //   if (isReady) {
  //     logger.info("Form Runner Started");
  //     return true;
  //   }
  // }
  return true;
}

export function getNewSessionWebhookData(
  listType: string,
  listItemId: number,
  questions: Array<Partial<FormRunner.Question>> | undefined,
  message: string
): FormRunner.NewSessionData {
  const callbackUrl = `http://localhost:3000/ingest/${listType}/${listItemId}`;
  const redirectPath = `/summary`;
  const options = {
    message,
    customText: {
      title: "Application resubmitted",
      paymentSkipped: false,
      nextSteps:
        "The British consulate or embassy will check your application again. If your application passes these checks your information will be published to the list.",
    },
    components: [],
    callbackUrl,
    redirectPath,
  };

  const newSessionData: FormRunner.NewSessionData = {
    questions,
    options,
    name: "Changes required",
  };
  return newSessionData;
}

export async function generateFormRunnerWebhookData(
  list: List,
  listItem: BaseListItemGetObject,
  isUnderTest?: boolean
): Promise<Array<Partial<FormRunner.Question>> | undefined> {
  let questions: Array<Partial<FormRunner.Question>> | undefined;

  switch (list.type) {
    case ServiceType.lawyers:
      questions = await lawyers.generateFormRunnerWebhookData(
        listItem as LawyerListItemGetObject,
        isUnderTest
      );
      break;
    default:
      questions = undefined;
  }

  return questions;
}

export async function parseJsonFormData(
  listType: string,
  isUnderTest?: boolean
): Promise<Array<Partial<FormRunner.Question>>> {
  const formsJsonFile =
    isUnderTest === true
      ? `/forms-json/${listType}.json`
      : `../src/server/components/formRunner/forms-json/${listType}.json`;
  const fileContents = await fs.promises.readFile(
    path.join(__dirname, formsJsonFile),
    "utf8"
  );
  const formJsonData = JSON.parse(fileContents);
  const questions: Array<Partial<FormRunner.Question>> = formJsonData.pages
    .map((page: FormRunner.Page) => {
      const fields: FormRunner.Field[] | undefined = page.components
        ?.filter((component: FormRunner.Component) => component.type !== "Html")
        ?.map((component: FormRunner.Component) => {
          const field: FormRunner.Field = {
            answer: "",
            key: component.name,
          };

          return field;
        });
      return {
        fields: fields,
        question: page.title,
      };
    })
    .filter((question: FormRunner.Question) => question.fields.length > 0);

  return questions;
}
