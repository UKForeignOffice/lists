import { toLower, startCase } from "lodash";
import { prisma } from "../db/__mocks__/prisma-client";
import * as locationService from "server/services/location";
import {
  LawyersFormWebhookData,
  CovidTestSupplierFormWebhookData,
} from "server/components/formRunner";
import {
  togglerListItemIsApproved,
  togglerListItemIsPublished,
  createLawyerListItem,
  findPublishedLawyersPerCountry,
  setEmailIsVerified,
  checkListItemExists,
  findListItemsForList,
  some,
  findPublishedCovidTestSupplierPerCountry,
  createCovidTestSupplierListItem,
  getListItemContactInformation,
} from "../listItem";
import * as audit from "../audit";
import { ServiceType } from "../types";

jest.mock("../db/prisma-client");

const LawyerWebhookData: LawyersFormWebhookData = {
  speakEnglish: true,
  englishSpeakLead: true,
  qualifiedToPracticeLaw: true,
  firstName: "Rene",
  middleName: undefined,
  surname: "Descartes",
  organisationName: "Cartesian Systems",
  websiteAddress: "www.cartesiansystems.com",
  emailAddress: "aa@aa.com",
  phoneNumber: "777766665555",
  addressLine1: "Cogito, Ergo Sum",
  addressLine2: "Street",
  city: "Touraine",
  postcode: "123456",
  country: "France",
  areasOfLaw:
    "Bankruptcy, Corporate, Criminal, Employment, Family, Health, Immigration, Intellectual property, International, Maritime, Personal injury, Real estate, Tax",
  canProvideLegalAid: true,
  canOfferProBono: true,
  representedBritishNationalsBefore: true,
  memberOfRegulatoryAuthority: true,
  regulatoryAuthority: "IBA",
  outOfHoursService: true,
  outOfHoursContactDetailsDifferent: true,
  outOfHoursContactDetailsDifferences: "phoneNumber, address, email",
  outOfHours: {
    phoneNumber: "88777766665555",
    addressLine1: "Cogito, Ergo Sum",
    addressLine2: "Street",
    city: "Touraine",
    postcode: "123456",
    country: "france",
    emailAddress: "outofhours@email.com",
  },
  declarationConfirm: "confirm",
};

const CovidTestProviderWebhookData: CovidTestSupplierFormWebhookData = {
  speakEnglish: true,
  isQualified: true,
  affiliatedWithRegulatoryAuthority: true,
  regulatoryAuthority: "Health Authority",
  meetUKstandards: true,
  provideResultsInEnglishFrenchSpanish: true,
  provideTestResultsIn72Hours: true,
  providedTests:
    "Antigen, Loop-mediated Isothermal Amplification (LAMP), Polymerase Chain Reaction (PCR)",
  turnaroundTimeAntigen: "1",
  turnaroundTimeLamp: "48",
  turnaroundTimePCR: "24",
  organisationDetails: {
    organisationName: "Covid Test Provider Name",
    locationName: "London",
    contactName: "Contact Name",
    contactEmailAddress: "aa@aa.com",
    contactPhoneNumber: "777654321",
    websiteAddress: "www.website.com",
    emailAddress: "contact@email.com",
    phoneNumber: "777654321",
    addressLine1: "Cogito, Ergo Sum",
    addressLine2: "Street",
    city: "Touraine",
    postcode: "123456",
    country: "france",
  },
  resultsReadyFormat: "Email,SMS",
  resultsFormat: "Email,SMS",
  bookingOptions: "Website,In Person",
  declarationConfirm: "confirm",
};

describe("ListItem Model:", () => {
  let sampleListItem: any;
  let sampleCountry: any;
  let sampleLocation: any;

  const spyListItemFindUnique = (
    returnValue = sampleListItem
  ): jest.SpyInstance => {
    return prisma.listItem.findUnique.mockResolvedValueOnce(returnValue);
  };

  const spyListItemCreate = (
    returnValue = sampleListItem
  ): jest.SpyInstance => {
    return prisma.listItem.create.mockResolvedValueOnce(
      returnValue ?? sampleListItem
    );
  };

  const spyListItemUpdate = (
    returnValue = sampleListItem
  ): jest.SpyInstance => {
    return prisma.listItem.update.mockResolvedValueOnce(returnValue);
  };

  const spyCountryUpsert = (returnValue = sampleCountry): jest.SpyInstance => {
    return prisma.country.upsert.mockResolvedValue(returnValue);
  };

  const spyLocationService = (
    returnValue = sampleLocation
  ): jest.SpyInstance => {
    return jest
      .spyOn(locationService, "geoLocatePlaceByText")
      .mockResolvedValue(returnValue);
  };

  const spyListItemCount = (returnValue: any): jest.SpyInstance => {
    return prisma.listItem.count.mockResolvedValue(returnValue);
  };

  const spyPrismaTransaction = (): jest.SpyInstance => {
    return prisma.$transaction.mockImplementation(
      (values) => Promise.all(values) as never
    );
  };

  const spyAuditRecordListItemEvent = (
    returnValue: any = {}
  ): jest.SpyInstance => {
    return jest
      .spyOn(audit, "recordListItemEvent")
      .mockResolvedValue(returnValue);
  };

  beforeEach(() => {
    sampleListItem = {
      id: "123ABC",
      jsonData: { organisationName: "The Amazing Lawyers" },
    };

    sampleCountry = { id: "123TEST", name: "United Kingdom" };

    sampleLocation = {
      Geometry: {
        Point: [1, 1],
      },
    };
  });

  describe("Create Lawyer", () => {
    test("createLawyer command correctly calls listItem count to check if record already exists", async () => {
      const spyCount = spyListItemCount(1);
      const spyCountry = spyCountryUpsert();

      try {
        await createLawyerListItem(LawyerWebhookData);
      } catch (error) {
        expect(error.message).toBe("Lawyer record already exists");
      }

      expect(spyCount.mock.calls[0][0]).toEqual({
        where: {
          AND: [
            {
              jsonData: {
                equals: LawyerWebhookData.organisationName.toLowerCase(),
                path: ["organisationName"],
              },
            },
          ],
          address: {
            country: {
              name: LawyerWebhookData.country,
            },
          },
        },
      });
      expect(spyCountry).not.toHaveBeenCalled();
    });

    test("createLawyer command correctly calls country.upsert", async () => {
      spyListItemCount(0);
      spyLocationService();
      spyListItemCreate();
      const spyCountry = spyCountryUpsert();

      try {
        await createLawyerListItem(LawyerWebhookData);
      } catch (error) {
        expect(error.message).toBe("Record already exists");
      }

      const expectedCountryName = startCase(toLower(LawyerWebhookData.country));

      expect(spyCountry).toHaveBeenCalledWith({
        where: { name: expectedCountryName },
        create: { name: expectedCountryName },
        update: {},
      });
    });

    test("createLawyer command correctly calls lawyer.create", async () => {
      spyListItemCount(0);
      spyLocationService();
      spyCountryUpsert();
      const spy = spyListItemCreate();

      try {
        await createLawyerListItem(LawyerWebhookData);
      } catch (error) {
        expect(error.message).toBe("Record already exists");
      }

      expect(spy).toHaveBeenCalledWith({
        data: {
          type: "lawyers",
          isApproved: false,
          isPublished: false,
          address: {
            create: {
              firstLine: "Cogito, Ergo Sum",
              secondLine: "Street",
              postCode: "123456",
              city: "Touraine",
              country: { connect: { id: "123TEST" } },
              geoLocation: {
                connect: {
                  id: undefined,
                },
              },
            },
          },
          jsonData: {
            organisationName: "cartesian systems",
            contactName: "Rene  Descartes",
            email: "aa@aa.com",
            telephone: "777766665555",
            website: "www.cartesiansystems.com",
            regulatoryAuthority: "IBA",
            englishSpeakLead: true,
            representedBritishNationalsBefore: true,
            legalAid: true,
            proBonoService: true,
            legalPracticeAreas: [
              "bankruptcy",
              "corporate",
              "criminal",
              "employment",
              "family",
              "health",
              "immigration",
              "intellectual property",
              "international",
              "maritime",
              "personal injury",
              "real estate",
              "tax",
            ],
            outOfHours: {
              email: "outofhours@email.com",
              telephone: "88777766665555",
              firstLine: "Cogito, Ergo Sum",
              secondLine: "Street",
              postCode: "123456",
              city: "Touraine",
            },
          },
        },
      });
    });

    test("createLawyer throws listItem.create error", async () => {
      spyListItemCount(0);
      spyLocationService();
      spyCountryUpsert();
      const error = new Error("CREATE ERROR");
      prisma.listItem.create.mockRejectedValueOnce(error);

      await expect(createLawyerListItem(LawyerWebhookData)).rejects.toEqual(
        error
      );
    });
  });

  describe("findPublishedLawyersPerCountry command is correct", () => {
    const expectedQuery = `
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
        ) as address,
        ST_Distance(
          "GeoLocation".location,
          ST_GeographyFromText('Point(1 1)')
        ) AS distanceInMeters
        FROM "ListItem"
        INNER JOIN "Address" ON "ListItem"."addressId" = "Address".id
        INNER JOIN "Country" ON "Address"."countryId" = "Country".id
        INNER JOIN "GeoLocation" ON "Address"."geoLocationId" = "GeoLocation".id
        WHERE "ListItem"."type" = 'lawyers'
        AND "Country".name = 'France'
        AND "ListItem"."jsonData" @> '{"legalAid":true,"proBonoService":true}'
        AND "ListItem"."isApproved" = true
        AND "ListItem"."isPublished" = true
        AND "ListItem"."isBlocked" = false
        ORDER BY distanceInMeters ASC
        LIMIT 20
    `.replace(/\s\s+/g, " ");

    test("query is correct", async () => {
      const spyLocation = spyLocationService();
      const spyQueryRaw = jest.spyOn(prisma, "$queryRaw").mockResolvedValue([]);

      await findPublishedLawyersPerCountry({
        countryName: "france",
        region: "paris",
        legalAid: "yes",
        proBono: "yes",
        practiceArea: [],
      });

      const query = spyQueryRaw.mock.calls[0][0] as string;

      expect(spyLocation).toHaveBeenCalledWith("paris, France");
      expect(query.replace(/\s\s+/g, " ")).toEqual(expectedQuery);
    });

    test("query without legalAid is correct", async () => {
      const spyLocation = spyLocationService();
      const spyQueryRaw = jest.spyOn(prisma, "$queryRaw").mockResolvedValue([]);

      await findPublishedLawyersPerCountry({
        countryName: "france",
        region: "paris",
        legalAid: "no",
        proBono: "yes",
        practiceArea: [],
      });

      const query = spyQueryRaw.mock.calls[0][0] as string;

      expect(spyLocation).toHaveBeenCalledWith("paris, France");
      expect(query.replace(/\s\s+/g, " ")).toEqual(
        expectedQuery.replace('"legalAid":true,', "")
      );
    });

    test("query without proBono is correct", async () => {
      const spyLocation = spyLocationService();
      const spyQueryRaw = jest.spyOn(prisma, "$queryRaw").mockResolvedValue([]);

      await findPublishedLawyersPerCountry({
        countryName: "france",
        region: "paris",
        legalAid: "yes",
        proBono: "no",
        practiceArea: [],
      });

      const query = spyQueryRaw.mock.calls[0][0] as string;

      expect(spyLocation).toHaveBeenCalledWith("paris, France");
      expect(query.replace(/\s\s+/g, " ")).toEqual(
        expectedQuery.replace(',"proBonoService":true', "")
      );
    });

    test("query without legalAid and proBono is correct", async () => {
      const spyLocation = spyLocationService();
      const spyQueryRaw = jest.spyOn(prisma, "$queryRaw").mockResolvedValue([]);

      await findPublishedLawyersPerCountry({
        countryName: "france",
        region: "paris",
        legalAid: "no",
        proBono: "no",
        practiceArea: [],
      });

      const query = spyQueryRaw.mock.calls[0][0] as string;

      expect(spyLocation).toHaveBeenCalledWith("paris, France");
      expect(query.includes(`AND "ListItem"."jsonData" @>`)).toEqual(false);
    });
  });

  describe("togglerListItemIsApproved", () => {
    test("update command is correct when approving", async () => {
      const spyUpdate = spyListItemUpdate();
      const spyTransaction = spyPrismaTransaction();
      const spyAudit = spyAuditRecordListItemEvent();

      const result = await togglerListItemIsApproved({
        id: 123,
        isApproved: true,
        userId: 1,
      });

      expect(spyUpdate).toHaveBeenCalledWith({
        where: { id: 123 },
        data: { isApproved: true },
      });

      expect(result).toBe(sampleListItem);
      expect(spyTransaction.mock.calls[0][0]).toHaveLength(2);
      expect(spyAudit).toHaveBeenCalledWith({
        eventName: "approve",
        itemId: 123,
        userId: 1,
      });
    });

    test("update command is correct when disapproving ", async () => {
      const spyUpdate = spyListItemUpdate();
      const spyTransaction = spyPrismaTransaction();
      const spyAudit = spyAuditRecordListItemEvent();

      const result = await togglerListItemIsApproved({
        id: 123,
        isApproved: false,
        userId: 1,
      });

      expect(result).toBe(sampleListItem);
      expect(spyUpdate).toHaveBeenCalledWith({
        where: { id: 123 },
        data: { isApproved: false, isPublished: false },
      });
      expect(spyTransaction.mock.calls[0][0]).toHaveLength(2);
      expect(spyAudit).toHaveBeenCalledWith({
        eventName: "disapprove",
        itemId: 123,
        userId: 1,
      });
    });

    test("it rejects if userId is undefined", async () => {
      await expect(
        togglerListItemIsApproved({
          id: 123,
          isApproved: false,
        } as any)
      ).rejects.toEqual(
        new Error("togglerListItemIsApproved Error: userId is undefined")
      );
    });
  });

  describe("togglerListItemIsPublished", () => {
    test("update command is correct when publishing", async () => {
      const spyUpdate = spyListItemUpdate();
      const spyTransaction = spyPrismaTransaction();
      const spyAudit = spyAuditRecordListItemEvent();

      const result = await togglerListItemIsPublished({
        id: 123,
        isPublished: true,
        userId: 1,
      });

      expect(result).toBe(sampleListItem);
      expect(spyUpdate).toHaveBeenCalledWith({
        where: { id: 123 },
        data: { isPublished: true },
      });
      expect(spyTransaction.mock.calls[0][0]).toHaveLength(2);
      expect(spyAudit).toHaveBeenCalledWith({
        eventName: "publish",
        itemId: 123,
        userId: 1,
      });
    });

    test("update command is correct when hiding ", async () => {
      const spyUpdate = spyListItemUpdate();
      const spyTransaction = spyPrismaTransaction();
      const spyAudit = spyAuditRecordListItemEvent();

      const result = await togglerListItemIsPublished({
        id: 123,
        isPublished: false,
        userId: 1,
      });

      expect(result).toBe(sampleListItem);
      expect(spyUpdate).toHaveBeenCalledWith({
        where: { id: 123 },
        data: { isPublished: false },
      });
      expect(spyTransaction.mock.calls[0][0]).toHaveLength(2);
      expect(spyAudit).toHaveBeenCalledWith({
        eventName: "unpublish",
        itemId: 123,
        userId: 1,
      });
    });

    test("it rejects if userId is undefined", async () => {
      await expect(
        togglerListItemIsPublished({
          id: 123,
          isApproved: false,
        } as any)
      ).rejects.toEqual(
        new Error("togglerListItemIsPublished Error: userId is undefined")
      );
    });
  });

  describe("setEmailIsVerified", () => {
    test("findUnique command is correct", async () => {
      const reference = "123ABC";
      const spy = spyListItemFindUnique({
        ...sampleListItem,
        jsonData: {
          ...sampleListItem.jsonData,
          metadata: {
            emailVerified: true,
          },
        },
      });

      const result = await setEmailIsVerified({ reference });

      expect(result).toBe(true);
      expect(spy).toHaveBeenCalledWith({
        where: { reference },
      });
    });

    test("it won't call update if email has already been verified", async () => {
      const reference = "123ABC";
      const spyFindUnique = spyListItemFindUnique({
        ...sampleListItem,
        jsonData: {
          ...sampleListItem.jsonData,
          metadata: {
            emailVerified: true,
          },
        },
      });
      const spyUpdate = spyListItemUpdate();

      const result = await setEmailIsVerified({ reference });

      expect(result).toBe(true);
      expect(spyFindUnique).toHaveBeenCalled();
      expect(spyUpdate).not.toHaveBeenCalled();
    });

    test("update command is correct", async () => {
      const reference = "123ABC";
      spyListItemFindUnique();
      const spyUpdate = spyListItemUpdate();

      const result = await setEmailIsVerified({ reference });

      expect(spyUpdate).toHaveBeenCalledWith({
        where: { reference },
        data: {
          jsonData: {
            ...sampleListItem.jsonData,
            metadata: { emailVerified: true },
          },
        },
      });

      expect(result).toBe(true);
    });

    test("it throws listItem.findUnique error", async () => {
      const reference = "123ABC";
      const error = new Error("listItem.findUnique error");
      prisma.listItem.findUnique.mockRejectedValueOnce(error);

      await expect(setEmailIsVerified({ reference })).rejects.toEqual(error);
    });

    test("it throws listItem.update error", async () => {
      const reference = "123ABC";
      const error = new Error("listItem.update error");

      spyListItemFindUnique();
      prisma.listItem.update.mockRejectedValueOnce(error);

      await expect(setEmailIsVerified({ reference })).rejects.toEqual(error);
    });
  });

  describe("checkListItemExists", () => {
    const countryName = "France";
    const organisationName = "XYZ Corp";
    const locationName = "Location Name";

    test("listItem.count call is correct without organisationName", async () => {
      const spy = spyListItemCount(0);

      await checkListItemExists({ countryName, organisationName });

      expect(spy).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              jsonData: {
                path: ["organisationName"],
                equals: organisationName.toLowerCase(),
              },
            },
          ],
          address: {
            country: {
              name: countryName,
            },
          },
        },
      });
    });

    test("listItem.count call is correct with organisationName", async () => {
      const spy = spyListItemCount(0);

      await checkListItemExists({
        countryName,
        organisationName,
        locationName,
      });

      expect(spy).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              jsonData: {
                path: ["organisationName"],
                equals: organisationName.toLowerCase(),
              },
            },
            {
              jsonData: {
                path: ["locationName"],
                equals: locationName.toLowerCase(),
              },
            },
          ],
          address: {
            country: {
              name: countryName,
            },
          },
        },
      });
    });

    test("it returns false when list item doesn't exist", async () => {
      spyListItemCount(0);
      const result = await checkListItemExists({
        countryName,
        organisationName,
      });
      expect(result).toBe(false);
    });

    test("it returns true when list item exists", async () => {
      spyListItemCount(1);
      const result = await checkListItemExists({
        countryName,
        organisationName,
      });
      expect(result).toBe(true);
    });
  });

  describe("findListItemsForList", () => {
    test("findMany command is correct", async () => {
      prisma.listItem.findMany.mockResolvedValue([sampleListItem]);

      await findListItemsForList({
        type: "lawyers",
        countryId: 1,
      } as any);

      expect(prisma.listItem.findMany).toHaveBeenCalledWith({
        where: {
          type: "lawyers",
          address: { countryId: 1 },
          jsonData: { path: ["metadata", "emailVerified"], equals: true },
        },
        include: {
          address: {
            select: {
              id: true,
              firstLine: true,
              secondLine: true,
              city: true,
              postCode: true,
              country: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    test("findMany result is correct", async () => {
      prisma.listItem.findMany.mockResolvedValue([sampleListItem]);

      const result = await findListItemsForList({
        type: "lawyers",
        countryId: 1,
      } as any);

      expect(result).toEqual([sampleListItem]);
    });

    test("it rejects when findMany command fails", async () => {
      prisma.listItem.findMany.mockRejectedValue({
        message: "findMany error message",
      });

      await expect(
        findListItemsForList({
          type: "lawyers",
          countryId: 1,
        } as any)
      ).rejects.toEqual(new Error("Failed to approve lawyer"));
    });
  });

  describe("some", () => {
    test("findMany command is correct", async () => {
      prisma.listItem.findMany.mockResolvedValue([sampleListItem]);

      await some("united kingdom" as any, ServiceType.covidTestProviders);

      expect(prisma.listItem.findMany).toHaveBeenCalledWith({
        where: {
          type: ServiceType.covidTestProviders,
          address: {
            country: {
              name: startCase(toLower("united kingdom")),
            },
          },
        },
        select: {
          id: true,
        },
        take: 1,
      });
    });

    test("it returns true when findMany finds listItems", async () => {
      prisma.listItem.findMany.mockResolvedValue([sampleListItem]);

      const result = await some(
        "united kingdom" as any,
        ServiceType.covidTestProviders
      );

      expect(result).toEqual(true);
    });

    test("it returns false when findMany does not find listItems", async () => {
      prisma.listItem.findMany.mockResolvedValue([]);

      const result = await some(
        "united kingdom" as any,
        ServiceType.covidTestProviders
      );

      expect(result).toEqual(false);
    });

    test("it returns false when findMany rejects", async () => {
      prisma.listItem.findMany.mockRejectedValue("");

      const result = await some(
        "united kingdom" as any,
        ServiceType.covidTestProviders
      );

      expect(result).toEqual(false);
    });
  });

  describe("findPublishedCovidTestSupplierPerCountry", () => {
    test("it throws when countryName is undefined", async () => {
      await expect(
        findPublishedCovidTestSupplierPerCountry({} as any)
      ).rejects.toEqual(new Error("Country name is missing"));
    });

    test("queryRaw command is correct", async () => {
      spyLocationService();
      const spyQueryRaw = prisma.$queryRaw.mockResolvedValue([]);

      await findPublishedCovidTestSupplierPerCountry({
        countryName: "ghana",
        region: "Accra",
        turnaroundTime: 1,
      });

      const query = spyQueryRaw.mock.calls[0][0] as string;
      const expectedQuery = `
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
        ) as address,
        ST_Distance(
          "GeoLocation".location,
          ST_GeographyFromText('Point(1 1)')
        ) AS distanceInMeters
        FROM "ListItem"
        INNER JOIN "Address" ON "ListItem"."addressId" = "Address".id
        INNER JOIN "Country" ON "Address"."countryId" = "Country".id
        INNER JOIN "GeoLocation" ON "Address"."geoLocationId" = "GeoLocation".id
        WHERE "ListItem"."type" = 'covidTestProviders'
        AND "Country".name = 'Ghana'
        AND ("ListItem"."jsonData"->>'fastestTurnaround')::int <= 1
        AND "ListItem"."isApproved" = true
        AND "ListItem"."isPublished" = true
        AND "ListItem"."isBlocked" = false
        ORDER BY distanceInMeters ASC
        LIMIT 20
    `.replace(/\s\s+/g, " ");
      expect(query.replace(/\s\s+/g, " ")).toEqual(expectedQuery);
    });

    test("result is correct", async () => {
      spyLocationService();
      prisma.$queryRaw.mockResolvedValue([sampleListItem]);

      const result = await findPublishedCovidTestSupplierPerCountry({
        countryName: "Ghana",
        region: "Accra",
        turnaroundTime: 1,
      });

      expect(result).toEqual([sampleListItem]);
    });

    test("it returns an empty list when queryRaw rejects", async () => {
      spyLocationService();
      prisma.$queryRaw.mockRejectedValue("");

      const result = await findPublishedCovidTestSupplierPerCountry({
        countryName: "Ghana",
        region: "Accra",
        turnaroundTime: 1,
      });

      expect(result).toEqual([]);
    });
  });

  describe("createCovidTestSupplierListItemObject", () => {
    // TODO
  });

  describe("createCovidTestSupplierListItem", () => {
    test("it rejects when listItem already exists", async () => {
      spyListItemCount(1);

      await expect(
        createCovidTestSupplierListItem(CovidTestProviderWebhookData)
      ).rejects.toEqual(new Error("Covid Test Supplier Record already exists"));
    });

    test("listItem create command is correct", async () => {
      spyListItemCount(0);
      spyLocationService();
      spyCountryUpsert();
      const spy = spyListItemCreate();

      await createCovidTestSupplierListItem(CovidTestProviderWebhookData);

      expect(spy).toHaveBeenCalledWith({
        data: {
          type: "covidTestProviders",
          isApproved: false,
          isPublished: false,
          jsonData: {
            organisationName: "covid test provider name",
            contactName: "Contact Name",
            contactEmailAddress: "aa@aa.com",
            contactPhoneNumber: "777654321",
            telephone: "777654321",
            email: "contact@email.com",
            website: "www.website.com",
            regulatoryAuthority: "Health Authority",
            resultsReadyFormat: ["Email", "SMS"],
            resultsFormat: ["Email", "SMS"],
            bookingOptions: ["website", "in person"],
            fastestTurnaround: 1,
            providedTests: [
              {
                turnaroundTime: 1,
                type: "Antigen",
              },
              {
                turnaroundTime: 48,
                type: "Loop-mediated Isothermal Amplification (LAMP)",
              },
              {
                turnaroundTime: 24,
                type: "Polymerase Chain Reaction (PCR)",
              },
            ],
          },
          address: {
            create: {
              firstLine: "Cogito, Ergo Sum",
              secondLine: "Street",
              postCode: "123456",
              city: "Touraine",
              country: {
                connect: {
                  id: "123TEST",
                },
              },
            },
          },
        },
      });
    });

    test("it rejects when listItem create command fails", async () => {
      spyListItemCount(0);
      spyLocationService();
      spyCountryUpsert();

      const error = { message: "Create Error" };
      prisma.listItem.create.mockRejectedValue(error);

      await expect(
        createCovidTestSupplierListItem(CovidTestProviderWebhookData)
      ).rejects.toEqual(error);
    });
  });

  describe("getListItemContactInformation", () => {
    test("contact information is correct when email and phoneNumber are set", () => {
      const listItem: any = {
        jsonData: {
          contactName: "ABC",
          phoneNumber: "123",
          email: "123",
        },
      };

      const contactInfo = getListItemContactInformation(listItem);
      expect(contactInfo).toEqual({
        contactName: "ABC",
        contactPhoneNumber: "123",
        contactEmailAddress: "123",
      });
    });

    test("contact information is correct when contactEmailAddress and contactPhoneNumber are set", () => {
      const listItem: any = {
        jsonData: {
          contactName: "ABC",
          contactPhoneNumber: "123",
          contactEmailAddress: "123",
        },
      };

      const contactInfo = getListItemContactInformation(listItem);
      expect(contactInfo).toEqual({
        contactName: "ABC",
        contactPhoneNumber: "123",
        contactEmailAddress: "123",
      });
    });
  });
});
