import { getListIdForCountryAndType } from "server/models/helpers";
import { CountryName, ServiceType } from "server/models/types";
import { logger } from "server/services/logger";
import {
  createAddressObject,
  createObject,
} from "server/models/listItem/providers/Lawyers";
import {
  BaseWebhookData,
  CovidTestSupplierFormWebhookData,
  LawyersFormWebhookData,
  WebhookData,
} from "server/components/formRunner";
import { AuditEvent, ListItemEvent, Prisma } from "@prisma/client";
import { trim } from "lodash";
import { ListItemWithAddressCountry } from "server/models/listItem/providers/types";
import { checkListItemExists } from "server/models/listItem/providers/helpers";
import { prisma } from "server/models/db/prisma-client";
import { recordListItemEvent } from "server/models/audit";
import { recordEvent } from "server/models/listItem/listItemEvent";

export * as LawyerListItem from "./Lawyers";
export * as CovidTestSupplierListItem from "./CovidTestSupplier";

enum TestType {
  Antigen = "Antigen",
  LAMP = "Loop-mediated Isothermal Amplification (LAMP)",
  PCR = "Polymerase Chain Reaction (PCR)",
}

type TurnaroundTimeProperties = keyof Pick<
  CovidTestSupplierFormWebhookData,
  "turnaroundTimeAntigen" | "turnaroundTimeLamp" | "turnaroundTimePCR"
>;

const turnaroundTimeProperties: Record<TestType, TurnaroundTimeProperties> = {
  [TestType.Antigen]: "turnaroundTimeAntigen",
  [TestType.LAMP]: "turnaroundTimeLamp",
  [TestType.PCR]: "turnaroundTimePCR",
};

type WebhookDeserialiser<T extends BaseWebhookData> = (webhookData: T) => {
  [k: string]: any;
};

function checkboxCSVToArray(checkboxValue: string): string[] {
  return checkboxValue.split(",").map(trim).filter(Boolean);
}

const covidTestProviderDeserialiser: WebhookDeserialiser<CovidTestSupplierFormWebhookData> =
  (webhookData) => {
    const {
      providedTests: providedTestsString,
      resultsFormat,
      resultsReadyFormat,
      bookingOptions,
      ...rest
    } = webhookData;

    const providedTests = checkboxCSVToArray(providedTestsString).map(
      (testName) => {
        const type = testName as TestType;
        return {
          type,
          turnaroundTime: parseInt(turnaroundTimeProperties[type]),
        };
      }
    );

    return {
      ...rest,
      providedTests,
      resultsFormat: checkboxCSVToArray(resultsFormat),
      resultsReadyFormat: checkboxCSVToArray(resultsReadyFormat),
      bookingOptions: checkboxCSVToArray(bookingOptions),
      fastestTurnaround: Math.min(
        ...providedTests.map((test) => test.turnaroundTime)
      ),
    };
  };

const lawyerDeserialiser: WebhookDeserialiser<LawyersFormWebhookData> = (
  webhookData
) => {
  const { areasOfLaw = [] } = webhookData;
  return {
    areasOfLaw: areasOfLaw.filter(Boolean),
  };
};

const deserialisers: Record<ServiceType, WebhookDeserialiser<any>> = {
  [ServiceType.covidTestProviders]: covidTestProviderDeserialiser,
  [ServiceType.lawyers]: lawyerDeserialiser,
};

async function listItemCreateInputFromWebhook(
  webhook: BaseWebhookData
): Promise<Prisma.ListItemCreateInput> {
  const { metadata, ...rest } = webhook;
  const { type } = metadata;

  const listId = await getListIdForCountryAndType(
    webhook.country as CountryName,
    type
  );

  if (!listId) {
    logger.error(
      `list for ${webhook.country} and ${type} could not be found`,
      "createListItem"
    );
  }

  const deserialiser = deserialisers[type];
  const deserialised = deserialiser(rest);

  return {
    type,
    isApproved: false,
    isPublished: false,
    list: {
      connect: {
        id: listId,
      },
    },
    jsonData: {
      ...deserialised,
    },
    address: {
      ...(await createAddressObject(webhook)),
    },
  };
}

/**
 * todo: type for deserialised data?
 */
export async function create(
  webhookData: WebhookData
): Promise<ListItemWithAddressCountry> {
  const exists = await checkListItemExists({
    organisationName: webhookData.organisationName,
    countryName: webhookData.country,
  });

  const { type } = webhookData.metadata;

  if (exists) {
    throw new Error(`${type} record already exists`);
  }

  try {
    const data = await listItemCreateInputFromWebhook(webhookData);

    const listItem = await prisma.listItem.create({
      data,
      include: {
        address: {
          include: {
            country: true,
          },
        },
      },
    });

    await recordListItemEvent(
      {
        eventName: "edit",
        itemId: listItem.id,
      },
      AuditEvent.NEW
    );

    await recordEvent(
      {
        eventName: "edit",
        itemId: listItem.id,
      },
      listItem.id,
      ListItemEvent.NEW
    );

    return listItem;
  } catch (error) {
    logger.error(`create ListItem failed ${error.message}`);
    throw error;
  }
}
