// Covid Test Suppliers
// TODO: Test
import { CovidTestSupplierFormWebhookData } from "server/components/formRunner";
import {
  CountryName,
  CovidTestSupplierListItemCreateInput,
  LawyerListItemGetObject,
  ServiceType,
} from "server/models/types";
import {
  createAddressGeoLocation,
  createCountry,
  getPlaceGeoPoint,
} from "./../geoHelpers";
import { getListIdForCountryAndType } from "server/models/helpers";
import { compact, startCase, toLower, trim } from "lodash";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import pgescape from "pg-escape";
import { ListItemWithAddressCountry } from "./types";
import { checkListItemExists, fetchPublishedListItemQuery } from "./helpers";

export async function createObject(
  formData: CovidTestSupplierFormWebhookData
): Promise<CovidTestSupplierListItemCreateInput> {
  try {
    const country = await createCountry(formData.organisationDetails.country);
    const geoLocationId = await createAddressGeoLocation(formData);

    const listId = await getListIdForCountryAndType(
      formData.organisationDetails.country as CountryName,
      ServiceType.covidTestProviders
    );

    const providedTests = compact(
      formData.providedTests
        .split(", ")
        .map(trim)
        .map((testName) => {
          switch (testName) {
            case "Antigen":
              return {
                type: testName,
                turnaroundTime: parseInt(formData.turnaroundTimeAntigen, 10),
              };
            case "Loop-mediated Isothermal Amplification (LAMP)":
              return {
                type: testName,
                turnaroundTime: parseInt(formData.turnaroundTimeLamp, 10),
              };
            case "Polymerase Chain Reaction (PCR)":
              return {
                type: testName,
                turnaroundTime: parseInt(formData.turnaroundTimePCR, 10),
              };
            default:
              return undefined;
          }
        })
    );

    return {
      type: ServiceType.covidTestProviders,
      isApproved: false,
      isPublished: false,
      list: {
        connect: {
          id: listId,
        },
      },
      jsonData: {
        organisationName: formData.organisationDetails.organisationName
          .toLowerCase()
          .trim(),
        contactName: formData.organisationDetails.contactName.trim(),
        contactEmailAddress: formData.organisationDetails.contactEmailAddress
          .toLocaleLowerCase()
          .trim(),
        contactPhoneNumber: formData.organisationDetails.contactPhoneNumber
          .toLocaleLowerCase()
          .trim(),
        telephone: formData.organisationDetails.phoneNumber,
        additionalTelephone: formData.organisationDetails.additionalPhoneNumber,
        email: formData.organisationDetails.emailAddress.toLowerCase().trim(),
        additionalEmail: formData.organisationDetails.additionalEmailAddress,
        website: formData.organisationDetails.websiteAddress
          .toLowerCase()
          .trim(),
        regulatoryAuthority: formData.regulatoryAuthority,
        resultsFormat: formData.resultsFormat.split(",").map(trim),
        resultsReadyFormat: formData.resultsReadyFormat.split(",").map(trim),
        bookingOptions: formData.bookingOptions
          .split(",")
          .map(trim)
          .map(toLower),
        providedTests,
        fastestTurnaround: Math.min(
          ...providedTests.map((test) => test.turnaroundTime)
        ),
      },
      address: {
        create: {
          firstLine: formData.organisationDetails.addressLine1,
          secondLine: formData.organisationDetails.addressLine2,
          postCode: formData.organisationDetails.postcode,
          city: formData.organisationDetails.city,
          country: {
            connect: { id: country.id },
          },
          ...(typeof geoLocationId === "number"
            ? {
                geoLocation: {
                  connect: {
                    id: geoLocationId,
                  },
                },
              }
            : {}),
        },
      },
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export async function create(
  webhookData: CovidTestSupplierFormWebhookData
): Promise<ListItemWithAddressCountry> {
  const exists = await checkListItemExists({
    organisationName: webhookData.organisationDetails.organisationName,
    locationName: webhookData.organisationDetails.locationName,
    countryName: webhookData.organisationDetails.country,
  });

  if (exists) {
    throw new Error("Covid Test Supplier Record already exists");
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
    logger.error(`CovidTestSupplier.create Error: ${error.message}`);
    throw error;
  }
}

export async function findPublishedCovidTestSupplierPerCountry(props: {
  countryName: string;
  region: string;
  turnaroundTime: number;
}): Promise<LawyerListItemGetObject[]> {
  if (props.countryName === undefined) {
    throw new Error("Country name is missing");
  }
  // @todo page parameter needs to be retrieved from the request.  Refactor once lawyers has been implemented.
  const offset = 0;

  try {
    let andWhere: string = "";

    if (props.turnaroundTime > 0) {
      andWhere = pgescape(
        `AND ("ListItem"."jsonData"->>'fastestTurnaround')::int <= %s`,
        props.turnaroundTime
      );
    }

    const countryName = startCase(toLower(props.countryName));

    const fromGeoPoint = await getPlaceGeoPoint({
      countryName,
      text: props.region,
    });

    const query = fetchPublishedListItemQuery({
      type: ServiceType.covidTestProviders,
      countryName,
      region: props.region,
      fromGeoPoint,
      andWhere,
      offset,
    });

    return await prisma.$queryRaw(query);
  } catch (error) {
    logger.error("findPublishedCovidTestSupplierPerCountry ERROR: ", error);
    return [];
  }
}
