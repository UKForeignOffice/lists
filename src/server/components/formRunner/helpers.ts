import * as FormRunner from "./types";
import path from "path";
import fs from "fs";
import {
  FuneralDirectorListItemGetObject,
  LawyerListItemGetObject,
  List,
  ListItem,
  ServiceType,
  TranslatorInterpreterListItemGetObject,
} from "server/models/types";
import * as lawyers from "./lawyers";
import * as funeralDirectors from "./funeralDirectors";
import * as translatorsInterpreters from "./translatorsInterpreters";
import { kebabCase, merge } from "lodash";
import { isLocalHost, SERVICE_DOMAIN } from "server/config";
import { createFormRunnerEditListItemLink, createFormRunnerReturningUserLink } from "server/components/lists/helpers";
import { getInitiateFormRunnerSessionToken } from "server/components/dashboard/helpers";
import { logger } from "server/services/logger";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";

export function getNewSessionWebhookData(
  listType: string,
  listItemId: number,
  questions: Array<Partial<FormRunner.Question>> | undefined,
  message: string,
  isAnnualReview: boolean | undefined,
  listItemRef: string
): FormRunner.NewSessionData {
  const callbackUrl = `http://lists:3000/ingest/${listType}/${listItemId}`;
  const redirectPath = "/summary";
  const protocol = isLocalHost ? "http" : "https";
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
    backUrl: isAnnualReview && `${protocol}://${SERVICE_DOMAIN}/annual-review/confirm/${listItemRef}`,
  };

  const newSessionData: FormRunner.NewSessionData = {
    questions,
    options,
    name: "Changes required",
    metadata: {
      isAnnualReview,
    },
  };
  return newSessionData;
}

export async function generateFormRunnerWebhookData(
  list: Pick<List, "type">,
  listItem: ListItem,
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
): Promise<Array<Partial<FormRunner.Question>>> {
  /**
   * TODO:- Ideally we can do a require.resolve(..) which will look in the current directory for the target, then in the parent etc
   * so that we don't need the isUnderTest flag. However, I suspect an issue to do with webpack is preventing us from
   * doing this properly. See branch `origin/fix/containers` rev 1e76...6bb.
   * For now, we need to keep ./forms-json in sync with /docker/apply/forms-json.
   * I have tried doing a babel/tsc/webpack/jest moduleNameMapping change but it is still causing errors.
   * Giving up. Enjoy
   */
  let baseDir = __dirname.replace("dist", "dist/src/server/components/formRunner");
  if (!baseDir.includes("dist")) {
    baseDir = baseDir.replace("/src/server/components/formRunner", "/dist/src/server/components/formRunner");
  }
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
}

interface initialiseFormRunnerInput {
  list: Pick<List, "type"> | Pick<ListItem, "type">;
  listItem: ListItem;
  message: string;
  isUnderTest: boolean;
  isAnnualReview?: boolean;
}

export async function initialiseFormRunnerSession({
  list,
  listItem,
  message,
  isUnderTest,
  isAnnualReview,
}: initialiseFormRunnerInput): Promise<string> {
  logger.info(
    `initialising form runnner session for list item id: ${listItem.id} with isAnnualReview ${isAnnualReview}`
  );

  const listItemJsonData = listItem?.jsonData as ListItemJsonData;
  listItem.jsonData = merge(listItem.jsonData, listItemJsonData.updatedJsonData ?? {});
  const questions = await generateFormRunnerWebhookData(list, listItem, isUnderTest);
  const formRunnerWebhookData = getNewSessionWebhookData(
    listItem.type,
    listItem.id,
    questions,
    message,
    isAnnualReview,
    listItem.reference
  );
  const formRunnerNewSessionUrl = createFormRunnerReturningUserLink(listItem.type, isAnnualReview!);
  const token = await getInitiateFormRunnerSessionToken(formRunnerNewSessionUrl, formRunnerWebhookData);

  return createFormRunnerEditListItemLink(token);
}
