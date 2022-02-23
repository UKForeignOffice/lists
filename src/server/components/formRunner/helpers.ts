import { set } from "lodash";
import request from "supertest";
import { spawn } from "child_process";
import { logger } from "server/services/logger";
import { FormRunnerComponent, FormRunnerFields, FormRunnerWebhookData } from "./types";
import { FORM_RUNNER_URL } from "./constants";
import { Country, LawyerListItemJsonData, ListItemGetObject, ServiceType } from "server/models/types";
import {
  Question,
  Fields,
  FormRunnerNewSessionWebhookData, FormRunnerNewSessionWebhookDataOptions
} from "../../../../lib/form-runner/runner/src/server/plugins/engine/models/types";
import path from "path";
import fs from "fs";


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
      `PRIVACY_POLICY_URL='' npm run form-runner:start`,
      {
        shell: true,
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

export async function generateFormRunnerWebhookData(listItem: ListItemGetObject, listCountry?: Partial<Country>): Promise<Array<Partial<Question>>> {
  const questions = await parseLawyerJsonFormData(ServiceType.lawyers);

  questions.forEach((question) => {
    question?.fields?.forEach((field) => {
      question.fields?.forEach((field) => {
        const jsonData:LawyerListItemJsonData = listItem.jsonData ?? {};

        switch (field.key) {
          case FormRunnerFields.country :
            field.answer = listCountry?.name;
            break;
          case FormRunnerFields.addressCountry :
            field.answer = listItem.address.country.name;
            break;
          case FormRunnerFields.addressLine1 :
            field.answer = listItem.address.firstLine;
            break;
          case FormRunnerFields.addressLine2 :
            field.answer = listItem.address.secondLine ?? "";
            break;
          case FormRunnerFields.city :
            field.answer = listItem.address.city;
            break;
          case FormRunnerFields.postcode :
            field.answer = listItem.address.postCode;
            break;
          case FormRunnerFields.phoneNumber :
            field.answer = jsonData.phoneNumber;
            break;
          case FormRunnerFields.emergencyPhoneNumber :
            field.answer = jsonData.emergencyPhoneNumber ?? "";
            break;
          case FormRunnerFields.emailAddress :
            field.answer = jsonData.emailAddress;
            break;
          case FormRunnerFields.publicEmailAddress :
            field.answer = jsonData.publicEmailAddress ?? "";
            break;
          case FormRunnerFields.websiteAddress :
            field.answer = jsonData.websiteAddress ?? "";
            break;
          case FormRunnerFields.firstAndMiddleNames : //@todo this needs to be combined in form runner
            field.answer = jsonData.contactName;
            break;
          case FormRunnerFields.organisationName :
            field.answer = jsonData.organisationName;
            break;
          case FormRunnerFields.size :
            field.answer = jsonData.size;
            break;
          case FormRunnerFields.regulators :
            field.answer = jsonData.regulators;
            break;
          case FormRunnerFields.regions :
            field.answer = jsonData.regions;
            break;
          case FormRunnerFields.areasOfLaw :
            field.answer = jsonData.areasOfLaw.join(", ");
            break;
          case FormRunnerFields.declaration :
            field.answer = jsonData.declaration.join(", ") ?? [];
            break;
          case FormRunnerFields.proBono :
            field.answer = `${jsonData.proBono}` ?? "";
            break;
          case FormRunnerFields.legalAid :
            field.answer = `${jsonData.legalAid}` ?? "";
            break;
          case FormRunnerFields.speakEnglish :
            field.answer = `${jsonData.speakEnglish}`;
            break;
          case FormRunnerFields.representedBritishNationals :
            field.answer = `${jsonData.representedBritishNationals}`;
            break;
          case FormRunnerFields.publishEmail :
            field.answer = `${jsonData.publishEmail}`;
            break;
        }
      });
    });
  });
  return questions;
}

export function getNewSessionWebhookData(questions: Array<Partial<Question>>, message: string): FormRunnerNewSessionWebhookData {
  const callbackUrl = "";
  const redirectPath = "";
  const options: FormRunnerNewSessionWebhookDataOptions = {
    message,
    callbackUrl,
    redirectPath
  };

  // Add change details to list JSON
  const formRunnerNewSessionData: FormRunnerNewSessionWebhookData = {
    questions,
    options,
    name: "test"
  };
  return formRunnerNewSessionData;
}


async function parseLawyerJsonFormData(listType: string): Promise<Array<Partial<Question>>> {

  const fileContents = await fs.promises.readFile(path.resolve(__dirname, `forms-json/${listType}.json`), 'utf8');

  const formJsonData = JSON.parse(fileContents);
  const questions: Array<Partial<Question>> = formJsonData.pages.map((page) => {
    const fields: Fields = page.components
      .filter((component: FormRunnerComponent) => component.type !== "Html")
      .map((component: FormRunnerComponent) => {
        return {
          answer: "",
          key: component.name,
          title: "",
          type: "",
        };
      });
    return {
      fields: fields,
      question: page.title
    };
  })
    .filter((question) => question.fields.length > 0);

  return questions;
}
