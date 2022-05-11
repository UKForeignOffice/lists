// Lawyers
import {
  BaseWebhookData,
  LawyersFormWebhookData,
} from "server/components/formRunner";
import {
  CountryName,
  LawyerListItemCreateInput,
  LawyerListItemGetObject,
  ServiceType,
} from "server/models/types";
import {
  createAddressGeoLocation,
  createCountry,
  getPlaceGeoPoint,
} from "./../geoHelpers";
import { getListIdForCountryAndType } from "server/models/helpers";
import { startCase, toLower, uniq } from "lodash";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { ListItemWithAddressCountry } from "./types";
import { legalPracticeAreasList } from "server/services/metadata";
import {
  checkListItemExists,
  fetchPublishedListItemQuery,
} from "server/models/listItem/providers/helpers";
import { recordListItemEvent } from "server/models/audit";
import { AuditEvent, ListItemEvent, Prisma } from "@prisma/client";
import { recordEvent } from "server/models/listItem/listItemEvent";

export async function createAddressObject(
  webhookData: BaseWebhookData
): Promise<Prisma.AddressCreateNestedOneWithoutListItemInput> {
  const {
    "address.firstLine": firstLine,
    "address.secondLine": secondLine,
    postCode,
    city,
    addressCountry,
    country,
  } = webhookData;
  const geoLocationId = await createAddressGeoLocation(webhookData);
  const dbCountry = await createCountry(addressCountry ?? country);

  return {
    create: {
      firstLine,
      secondLine,
      postCode,
      city,
      country: {
        connect: {
          id: dbCountry.id,
        },
      },
      geoLocation: {
        connect: {
          id: geoLocationId,
        },
      },
    },
  };
}

export async function createObject(
  lawyer: LawyersFormWebhookData
): Promise<LawyerListItemCreateInput> {
  try {
    const { areasOfLaw, ...rest } = lawyer;

    const listId = await getListIdForCountryAndType(
      lawyer.country as CountryName,
      ServiceType.lawyers
    );

    return {
      type: ServiceType.lawyers,
      isApproved: false,
      isPublished: false,
      list: {
        connect: {
          id: listId,
        },
      },
      jsonData: {
        ...rest,
        areasOfLaw: uniq(areasOfLaw ?? []),
      },
      address: {
        ...(await createAddressObject(lawyer)),
      },
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export async function create(
  webhookData: LawyersFormWebhookData
): Promise<ListItemWithAddressCountry> {
  const exists = await checkListItemExists({
    organisationName: webhookData.organisationName,
    countryName: webhookData.country,
  });

  if (exists) {
    throw new Error("Lawyer record already exists");
  }

  try {
    const data = await createObject(webhookData);

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
    logger.error(`createLawyerListItem Error: ${error.message}`);
    throw error;
  }
}

export async function findPublishedLawyersPerCountry(props: {
  countryName?: string;
  region?: string | "";
  legalAid?: "yes" | "no" | "";
  proBono?: "yes" | "no" | "";
  practiceArea?: string[];
  offset?: number;
}): Promise<LawyerListItemGetObject[]> {
  if (props.countryName === undefined) {
    throw new Error("Country name is missing");
  }
  const offset = props.offset ?? 0;
  const countryName = startCase(toLower(props.countryName));
  const andWhere: string[] = [];
  const jsonQuery: {
    legalAid?: boolean;
    proBono?: boolean;
  } = {};

  if (props.legalAid === "yes") {
    jsonQuery.legalAid = true;
  }

  if (props.proBono === "yes") {
    jsonQuery.proBono = true;
  }

  if (Object.keys(jsonQuery).length > 0) {
    andWhere.push(
      `AND "ListItem"."jsonData" @> '${JSON.stringify(jsonQuery)}'`
    );
  }

  if (props.practiceArea !== undefined && props.practiceArea.length > 0) {
    let legalPracticeAreas = props.practiceArea;
    if (legalPracticeAreas.some((item) => item === "all")) {
      legalPracticeAreas = legalPracticeAreasList.map((area) =>
        area.toLowerCase()
      );
    }
    andWhere.push(
      `AND ARRAY(select lower(jsonb_array_elements_text("ListItem"."jsonData"->'areasOfLaw'))) && ARRAY ${JSON.stringify(
        legalPracticeAreas
      ).replace(/"/g, "'")}`
    );
  }

  try {
    const fromGeoPoint = await getPlaceGeoPoint({
      countryName,
      text: props.region,
    });

    const query = fetchPublishedListItemQuery({
      type: ServiceType.lawyers,
      countryName,
      region: props.region,
      fromGeoPoint,
      andWhere: andWhere.join(" "),
      offset,
    });

    return await prisma.$queryRaw(query);
  } catch (error) {
    logger.error("findPublishedLawyers ERROR: ", error);
    return [];
  }
}
