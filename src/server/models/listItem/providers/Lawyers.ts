// Lawyers
import { LawyersFormWebhookData } from "server/components/formRunner";
import {
  Address,
  CountryName,
  LawyerListItemCreateInput,
  LawyerListItemGetObject,
  ListItem,
  ServiceType,
} from "server/models/types";
import {
  createAddressGeoLocation,
  createCountry,
  getPlaceGeoPoint,
} from "./../geoHelpers";
import { getListIdForCountryAndType } from "server/models/helpers";
import { at, difference, startCase, toLower, uniq } from "lodash";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { Prisma } from "@prisma/client";
import { ListItemWithAddressCountry, UpdatableAddressFields } from "./types";
import { legalPracticeAreasList } from "server/services/metadata";
import {
  checkListItemExists,
  fetchPublishedListItemQuery,
} from "server/models/listItem/providers/helpers";
import { merge, isEqual, pick } from "lodash";

export async function createObject(
  lawyer: LawyersFormWebhookData
): Promise<LawyerListItemCreateInput> {
  try {
    const {
      addressCountry,
      addressLine1,
      addressLine2,
      areasOfLaw,
      city,
      familyName,
      firstAndMiddleNames,
      postcode,
      ...rest
    } = lawyer;
    const country = await createCountry(addressCountry);
    const geoLocationId = await createAddressGeoLocation(lawyer);

    const listId = await getListIdForCountryAndType(
      lawyer.country as CountryName,
      ServiceType.lawyers
    );

    return {
      type: ServiceType.lawyers,
      isApproved: false,
      isPublished: false,
      listId,
      jsonData: {
        ...rest,
        areasOfLaw: uniq(areasOfLaw ?? []),
        contactName: `${firstAndMiddleNames} ${familyName}`,
      },
      address: {
        create: {
          firstLine: addressLine1,
          secondLine: addressLine2,
          postCode: postcode,
          city,
          country: {
            connect: {
              id: country.id,
            },
          },
          geoLocation: {
            connect: {
              id: typeof geoLocationId === "number" ? geoLocationId : undefined,
            },
          },
        },
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

    return await prisma.listItem.create({
      data,
      include: {
        address: {
          include: {
            country: true,
          },
        },
      },
    });
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
