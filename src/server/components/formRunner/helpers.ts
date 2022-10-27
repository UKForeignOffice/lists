import * as FormRunner from "./types";
import path from "path";
import fs from "fs";
import {
  LawyerListItemGetObject,
  FuneralDirectorListItemGetObject,
  TranslatorInterpreterListItemGetObject,
  List,
  BaseListItemGetObject,
  ServiceType,
} from "server/models/types";
import * as lawyers from "./lawyers";
import * as funeralDirectors from "./funeralDirectors";
import * as translatorsInterpreters from "./translatorsInterpreters";
import { kebabCase } from "lodash";
import { logger } from "server/services/logger";

export function getNewSessionWebhookData(
  listType: string,
  listItemId: number,
  questions: Array<Partial<FormRunner.Question>> | undefined,
  message: string
): FormRunner.NewSessionData {
  const callbackUrl = `http://lists:3000/ingest/${listType}/${listItemId}`;
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
  isUnderTest: boolean
): Promise<Array<Partial<FormRunner.Question>> | undefined> {
  let questions: Array<Partial<FormRunner.Question>> | undefined;

  switch (list.type) {
    case ServiceType.lawyers:
      questions = await lawyers.generateFormRunnerWebhookData(listItem as LawyerListItemGetObject, isUnderTest);
      break;
    case ServiceType.funeralDirectors:
      questions = await funeralDirectors.generateFormRunnerWebhookData(
        listItem as FuneralDirectorListItemGetObject,
        isUnderTest
      );
      break;
    case ServiceType.translatorsInterpreters:
      questions = await translatorsInterpreters.generateFormRunnerWebhookData(
        listItem as TranslatorInterpreterListItemGetObject,
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
  isUnderTest: boolean = false
): Promise<Array<Partial<FormRunner.Question>> | undefined> {
  /**
   * TODO:- Ideally we can do a require.resolve(..) which will look in the current directory for the target, then in the parent etc
   * so that we don't need the isUnderTest flag. However, I suspect an issue to do with webpack is preventing us from
   * doing this properly. See branch `origin/fix/containers` rev 1e76...6bb.
   * For now, we need to keep ./forms-json in sync with /docker/apply/forms-json.
   * I have tried doing a babel/tsc/webpack/jest moduleNameMapping change but it is still causing errors.
   * Giving up. Enjoy
   */

  try {
    const baseDir = isUnderTest
      ? __dirname.replace("src/server/components/formRunner", "docker/apply")
      : __dirname.replace("dist", "docker/apply");
    const formsJsonFile = `/forms-json/${kebabCase(listType)}.json`;

    const fileContents = await fs.promises.readFile(path.join(baseDir, formsJsonFile), "utf8");
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
  } catch (error) {
    throw new Error(`parseJsonFormData Error: ${(error as Error).message}`);
  }
}
