import type * as FormRunner from "./types";
import type {
  FuneralDirectorListItemGetObject,
  LawyerListItemGetObject,
  List,
  ListItem,
  TranslatorInterpreterListItemGetObject,
} from "server/models/types";
import { ServiceType } from "shared/types";
import * as lawyers from "./lawyers";
import * as funeralDirectors from "./funeralDirectors";
import * as translatorsInterpreters from "./translatorsInterpreters";
import { CALLBACK_URL, isLocalHost, SERVICE_DOMAIN } from "server/config";
import { createFormRunnerEditListItemLink, createFormRunnerReturningUserLink } from "server/components/lists/helpers";
import { getInitiateFormRunnerSessionToken } from "server/components/dashboard/helpers";
import { logger } from "server/services/logger";
import type { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { getChangedAddressFields } from "server/models/listItem/providers/helpers";
import type { ListItemWithAddressCountry } from "server/models/listItem/providers/types";
import { forms } from "./forms";

interface NewSessionWebhookDataInput {
  listType: string;
  listItemId: number;
  questions?: Array<Partial<FormRunner.Question>>;
  message: string;
  isAnnualReview?: boolean;
  listItemRef: string;
  title?: string;
  skipSummaryUrl?: string;
  metadata?: FormRunner.NewSessionData["metadata"];
}

const DEFAULT_OPTIONS = {
  customText: {
    title: "Application resubmitted",
    paymentSkipped: false,
    nextSteps:
      "The British consulate or embassy will check your application again. If your application passes these checks your information will be published to the list.",
  },
  components: [],
};
export function getNewSessionWebhookData({
  listType,
  listItemId,
  questions,
  message,
  isAnnualReview,
  listItemRef,
  title,
  skipSummaryUrl,
  metadata,
}: NewSessionWebhookDataInput): FormRunner.NewSessionData {
  const callbackUrl = `http://${CALLBACK_URL}/ingest/${listType}/${listItemId}`;
  const redirectPath = "/summary";
  const protocol = isLocalHost ? "http" : "https";

  const options = {
    ...DEFAULT_OPTIONS,
    message,
    callbackUrl,
    redirectPath,
    backUrl: isAnnualReview && `${protocol}://${SERVICE_DOMAIN}/annual-review/confirm/${listItemRef}`,
    ...(title && { title }),
    ...(skipSummaryUrl && {
      skipSummary: {
        redirectUrl: skipSummaryUrl,
      },
    }),
  };

  const newSessionData: FormRunner.NewSessionData = {
    questions,
    options,
    name: "Changes required",
    metadata: {
      ...metadata,
      isAnnualReview,
    },
  };
  return newSessionData;
}

export async function generateFormRunnerWebhookData(
  list: Pick<List, "type">,
  listItem: ListItem
): Promise<Array<Partial<FormRunner.Question>> | undefined> {
  let questions: Array<Partial<FormRunner.Question>> | undefined;
  switch (list.type) {
    case ServiceType.lawyers:
      questions = await lawyers.generateFormRunnerWebhookData(listItem as LawyerListItemGetObject);
      break;
    case ServiceType.funeralDirectors:
      questions = await funeralDirectors.generateFormRunnerWebhookData(listItem as FuneralDirectorListItemGetObject);
      break;
    case ServiceType.translatorsInterpreters:
      questions = await translatorsInterpreters.generateFormRunnerWebhookData(
        listItem as TranslatorInterpreterListItemGetObject
      );
      break;
    default:
      questions = undefined;
  }

  return questions;
}

export async function parseJsonFormData(
  listType: "funeralDirectors" | "lawyers" | "translatorsInterpreters"
): Promise<Array<Partial<FormRunner.Question>>> {
  const formJsonData = forms[listType];
  const pages = formJsonData.pages as FormRunner.Page[];

  const questions: Array<Partial<FormRunner.Question>> = pages
    .map((page) => {
      const fields: FormRunner.Field[] | undefined = page.components
        ?.filter((component) => component.type !== "Html")
        ?.map((component) => {
          const field: FormRunner.Field = {
            answer: "",
            key: component.name,
          };

          return field;
        });
      return {
        fields: fields ?? [],
        question: page.title,
      };
    })
    ?.filter((question) => question.fields.length > 0);

  return questions;
}

interface initialiseFormRunnerInput {
  list: Pick<List, "type"> | Pick<ListItem, "type">;
  listItem: ListItemWithAddressCountry;
  message: string;
  isAnnualReview?: boolean;
  title?: string;
  metadata?: FormRunner.NewSessionData["metadata"];
  skipSummaryUrl?: string;
}

export async function initialiseFormRunnerSession({
  list,
  listItem,
  message,
  isAnnualReview,
  title,
  metadata,
  skipSummaryUrl,
}: initialiseFormRunnerInput): Promise<string> {
  logger.info(
    `initialising form runnner session for list item id: ${listItem.id} with isAnnualReview ${isAnnualReview}`
  );

  const { updatedJsonData, ...jsonData } = listItem.jsonData as ListItemJsonData;
  const mergedJsonData = {
    ...jsonData,
    ...updatedJsonData,
  };

  const listItemForInit = {
    ...listItem,
    jsonData: mergedJsonData,
    address: {
      ...listItem.address,
      ...getChangedAddressFields(mergedJsonData, listItem.address),
    },
  };

  const questions = await generateFormRunnerWebhookData(list, listItemForInit);
  const formRunnerWebhookData = getNewSessionWebhookData({
    listType: listItem.type,
    listItemId: listItem.id,
    questions,
    message,
    isAnnualReview,
    listItemRef: listItem.reference,
    title,
    skipSummaryUrl,
    metadata,
  });
  const formRunnerNewSessionUrl = createFormRunnerReturningUserLink(listItem.type, isAnnualReview!);
  const token = await getInitiateFormRunnerSessionToken(formRunnerNewSessionUrl, formRunnerWebhookData);

  logger.info(`form runner session initialised for list item id: ${listItem.id} with token ${token}`);

  return createFormRunnerEditListItemLink(token);
}
