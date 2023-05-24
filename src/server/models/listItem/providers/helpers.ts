import { Address, CountryName, ListItem, Point } from "server/models/types";
import { ServiceType } from "shared/types";
import pgescape from "pg-escape";
import { geoPointIsValid } from "server/models/helpers";
import { ROWS_PER_PAGE } from "server/models/listItem/pagination";
import { prisma } from "shared/prisma";;
import { get, startCase } from "lodash";
import { logger } from "server/services/logger";
import { LanguageRow, LanguageRows, UpdatableAddressFields } from "server/models/listItem/providers/types";
import { DeserialisedWebhookData, ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import * as metaData from "server/services/metadata";
import { countriesList, languages, legalPracticeAreasList } from "server/services/metadata";
import { listsRoutes } from "server/components/lists";
import { HttpException } from "server/middlewares/error-handlers";
import { getObjectDiff } from "server/components/lists/controllers/ingest/helpers";

/**
 * Constructs SQL for querying published list items.  If the region is not populated
 * or is set to "Not set" then it will be ordered by company name otherwise by distance
 * from the geo point.
 * @param props
 */
export function fetchPublishedListItemQuery(props: {
  type: string;
  countryName: string;
  region?: string;
  fromGeoPoint?: Point;
  andWhere?: string;
  offset: number;
}): string {
  const { type, countryName, region, fromGeoPoint, andWhere, offset } = props;
  const whereType = pgescape(`WHERE "ListItem"."type" = %L`, type);
  const whereCountryName = pgescape(`AND lower("Country".name) = %L`, countryName.toLowerCase());

  let withDistance = "";
  let orderBy = `ORDER BY "ListItem"."jsonData"->>'organisationName' ASC`;

  if (geoPointIsValid(fromGeoPoint) && region !== undefined && region !== "" && region !== "Not set") {
    withDistance = `,
    ST_Distance(
        "GeoLocation".location,
        ST_GeographyFromText('Point(${fromGeoPoint?.join(" ")})')
      ) AS distanceInMeters
    `;

    orderBy = "ORDER BY distanceInMeters ASC";
  }
  let limitOffset = "";
  if (ROWS_PER_PAGE >= 0 && offset >= 0) {
    limitOffset = `LIMIT ${ROWS_PER_PAGE} OFFSET ${offset}`;
  }

  return `
    SELECT
      "ListItem"."id",
 	    "ListItem"."reference",
 	    "ListItem"."type",
 	    "ListItem"."jsonData",
	    (
 	   	  SELECT ROW_TO_JSON(a)
 		    FROM (
			    SELECT
				    "Address"."firstLine",
				    "Address"."secondLine",
				    "Address"."city",
				    "Address"."postCode",
				    (
					    SELECT ROW_TO_JSON(c)
					    FROM (
						    SELECT name
						    FROM "Country"
						    WHERE "Address"."countryId" = "Country"."id"
					    ) as c
		  	    ) as country
 	          FROM "Address"
			      WHERE "Address".id = "ListItem"."addressId"
 		    ) as a
 	    ) as address${withDistance}

    FROM "ListItem"
 	  INNER JOIN "Address" ON "ListItem"."addressId" = "Address".id
 	  INNER JOIN "List" ON "ListItem"."listId" = "List".id
	  INNER JOIN "Country" ON "List"."countryId" = "Country".id
    INNER JOIN "GeoLocation" ON "Address"."geoLocationId" = "GeoLocation".id
    ${whereType}
    ${whereCountryName}
    ${andWhere ?? ""}
    AND "ListItem"."isApproved" = true
    AND "ListItem"."isPublished" = true
    AND "ListItem"."isBlocked" = false
    ${orderBy}
    ${limitOffset}
  `;
}

export async function checkListItemExists({
  organisationName,
  locationName,
  countryName,
}: {
  organisationName: string;
  locationName?: string;
  countryName: string;
}): Promise<boolean> {
  const jsonDataQuery = [
    {
      jsonData: {
        path: ["organisationName"],
        equals: organisationName.toLocaleLowerCase(),
      },
    },
  ];

  if (locationName !== undefined && locationName !== null) {
    jsonDataQuery.push({
      jsonData: {
        path: ["locationName"],
        equals: locationName.toLocaleLowerCase(),
      },
    });
  }

  const total = await prisma.listItem.count({
    where: {
      AND: jsonDataQuery,
      address: {
        country: {
          name: startCase(countryName),
        },
      },
    },
  });

  return total > 0;
}

export async function some(countryName: CountryName, serviceType: ServiceType): Promise<boolean> {
  try {
    const result = await prisma.listItem.findMany({
      where: {
        isApproved: true,
        isPublished: true,
        type: serviceType,
        list: {
          country: {
            name: {
              equals: countryName,
              mode: "insensitive",
            },
          },
        },
      },
      select: {
        id: true,
      },
      take: 1,
    });

    return result.length > 0;
  } catch (error: unknown) {
    const typedError = error as { message: string };
    logger.error(`countryHasAnyListItem Error: ${typedError.message}`);
    return false;
  }
}

export function getListItemContactInformation(listItem: ListItem): {
  contactName: string;
  contactEmailAddress: string;
  contactPhoneNumber: string;
} {
  const contactName = get(listItem?.jsonData, "contactName")!;
  const contactEmailAddress = get(listItem?.jsonData, "emailAddress")!;
  const contactPhoneNumber = get(listItem?.jsonData, "contactPhoneNumber") ?? get(listItem?.jsonData, "phoneNumber")!;
  return { contactName, contactEmailAddress, contactPhoneNumber };
}

export function getChangedAddressFields(
  webhook: DeserialisedWebhookData | ListItemJsonData,
  address: Partial<Address>
): Partial<UpdatableAddressFields> {
  const updatableAddressObject: UpdatableAddressFields = {
    firstLine: address?.firstLine,
    secondLine: address?.secondLine ?? undefined, // Casting to undefined when address?.secondLine nullish (i.e. null OR undefined) so a strict comparison `===` can be made.
    postCode: address?.postCode,
    city: address?.city,
  };

  const webhookAsAddress = {
    firstLine: webhook?.["address.firstLine"] ?? address?.firstLine,
    secondLine: webhook?.["address.secondLine"] ?? address?.secondLine ?? undefined,
    postCode: webhook?.postCode ?? address.postCode,
    city: webhook?.city ?? address.city,
  };

  return getObjectDiff(updatableAddressObject, webhookAsAddress);
}

export function setLanguagesProvided(newLanguage: string, languagesProvided: string): string {
  return languagesProvided === "" ? `${newLanguage}` : languagesProvided.concat(`,${newLanguage}`);
}

export function getLanguageNames(languagesProvided: string): string | undefined {
  if (!languagesProvided) {
    return undefined;
  }
  languagesProvided = languagesProvided
    ?.split(",")
    .filter((language: string) => {
      // @ts-ignore
      const languageName: string = languages[language];
      return languageName;
    })
    .join(",");
  return languagesProvided;
}

export function getLanguagesRows(languagesProvided: string, queryString: string): LanguageRows {
  if (!languagesProvided) {
    const languageRows: LanguageRows = { rows: [] };
    return languageRows;
  }
  const languagesJson: LanguageRow[] = languagesProvided?.split(",").map((language: string) => {
    // @ts-ignore
    const languageName: string = languages[language];
    logger.info(`language name: ${languageName}`);
    const removeLanguageUrl = listsRoutes.removeLanguage.replace(":language", language);

    const languageRow: LanguageRow = {
      key: {
        text: language,
        classes: "govuk-summary-list__row--hidden-titles",
      },
      value: {
        text: languageName,
        classes: "govuk-summary-list__key--hidden-titles",
      },
      actions: {
        items: [
          {
            href: `${removeLanguageUrl}?${queryString}`,
            text: "Remove",
            visuallyHiddenText: language,
          },
        ],
      },
    };
    return languageRow;
  });

  const languageRows: LanguageRows = {
    rows: languagesJson,
  } || { rows: [] };
  return languageRows;
}

export function validateCountry(countryName: string): string | undefined {
  const matchingCountryName = countriesList.find((country) => country.value === countryName)?.value;
  if (!matchingCountryName) logger.error(`Invalid country ${countryName} detected`);
  return matchingCountryName;
}

export function cleanLegalPracticeAreas(practiceAreas: string[] | undefined = []): string[] {
  const lowercasedPracticeAreas = practiceAreas.map((area) => area.toLowerCase());
  const lowercasedAllLegalPracticeAreas: string[] = legalPracticeAreasList.map((area) => area.toLowerCase());

  if (lowercasedPracticeAreas.find((area) => area === "all")) {
    return lowercasedAllLegalPracticeAreas;
  }

  const validatedPracticeAreas = lowercasedPracticeAreas.filter((areaToValidate) => {
    return lowercasedAllLegalPracticeAreas.find((area) => area === areaToValidate);
  });

  if (validatedPracticeAreas.length === 0) {
    throw new HttpException(403, "403", "Legal practice area could not be identified");
  }

  return validatedPracticeAreas;
}

export function cleanTranslatorInterpreterServices(servicesProvided: string[] = []): string[] {
  const matchingServicesProvided = servicesProvided
    .filter((service) => {
      return metaData.translationInterpretationServices.some((translationInterpretationService) => {
        return translationInterpretationService.value.toLowerCase() === service.toLowerCase();
      });
    })
    .map((service) => service.toLowerCase());

  if (matchingServicesProvided.length === 0) {
    throw new HttpException(403, "403", "Services could not be identified");
  }
  return matchingServicesProvided;
}

export function cleanTranslatorSpecialties(translationSpecialties: string[] = []): string[] {
  const matchingTranslatorSpecialities = translationSpecialties
    .filter((selectedTranslationSpecialty) => {
      return metaData.translationSpecialties.some((translationSpecialty) => {
        return (
          translationSpecialty.value.toLowerCase() === selectedTranslationSpecialty.toLowerCase() ||
          selectedTranslationSpecialty.toLowerCase() === "all"
        );
      });
    })
    .map((service) => service.toLowerCase());

  if (matchingTranslatorSpecialities.length === 0) {
    throw new HttpException(403, "403", "Translation services could not be identified");
  }
  return matchingTranslatorSpecialities;
}

export function cleanInterpreterServices(interpreterServices: string[] = []): string[] {
  const matchingInterpreterServices = interpreterServices
    .filter((selectedInterpreterSpecialty) => {
      return metaData.interpretationServices.some((interpreterSpecialty) => {
        return (
          interpreterSpecialty.value.toLowerCase() === selectedInterpreterSpecialty.toLowerCase() ||
          selectedInterpreterSpecialty.toLowerCase() === "all"
        );
      });
    })
    .map((service) => service.toLowerCase());

  if (matchingInterpreterServices.length === 0) {
    throw new HttpException(403, "403", "Interpreter services could not be identified");
  }

  return matchingInterpreterServices;
}

export function cleanLanguagesProvided(languagesProvided: string[] = []): string[] {
  const matchingLanguages = languagesProvided
    .filter((language) => languages[language.toLowerCase()])
    .map((language) => language.toLowerCase());

  if (matchingLanguages.length === 0) {
    throw new HttpException(403, "403", "Languages could not be identified");
  }

  return matchingLanguages;
}
