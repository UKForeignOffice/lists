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
import { fetchPublishedListItemQuery } from "./helpers";

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

export async function createObject(
  formData: CovidTestSupplierFormWebhookData
): Promise<CovidTestSupplierListItemCreateInput> {
  try {
    const country = await createCountry(formData.country);
    const geoLocationId = await createAddressGeoLocation(formData);

    const listId = await getListIdForCountryAndType(
      formData.country as CountryName,
      ServiceType.covidTestProviders
    );

    const providedTests = compact(
      formData.providedTests
        .split(", ")
        .map(trim)
        .map((testName) => {
          const type = testName as TestType;
          if (!type) {
            return undefined;
          }
          return {
            type,
            turnaroundTime: parseInt(turnaroundTimeProperties[type]),
          };
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
        organisationName: formData.organisationName.toLowerCase().trim(),
        contactName: formData.contactName.trim(),
        contactEmailAddress: formData.contactEmailAddress
          .toLocaleLowerCase()
          .trim(),
        contactPhoneNumber: formData.contactPhoneNumber
          .toLocaleLowerCase()
          .trim(),
        telephone: formData.phoneNumber,
        additionalTelephone: formData.additionalPhoneNumber,
        email: formData.emailAddress.toLowerCase().trim(),
        additionalEmail: formData.additionalEmailAddress,
        website: formData.websiteAddress.toLowerCase().trim(),
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
          firstLine: formData.firstLine,
          secondLine: formData.secondLine,
          postCode: formData.postCode,
          city: formData.city,
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
