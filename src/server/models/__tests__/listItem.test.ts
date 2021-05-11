import { toLower, startCase } from "lodash";

import { LawyersFormWebhookData } from "server/services/form-runner";
import * as locationService from "server/services/location";
import { prisma } from "../db/prisma-client";
import {
  approveListItem,
  publishListItem,
  blockListItem,
  createLawyerListItem,
  findPublishedLawyersPerCountry,
} from "../listItem";

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

describe("ListItem Model:", () => {
  const sampleLawyer = { organisationName: "The Amazing Lawyers" };

  const spyLawyerCreate = (returnValue?: any): jest.SpyInstance => {
    return jest
      .spyOn(prisma.listItem, "create")
      .mockResolvedValue(returnValue ?? sampleLawyer);
  };

  const spyLawyerUpdate = (returnValue?: any): jest.SpyInstance => {
    return jest
      .spyOn(prisma.listItem, "update")
      .mockResolvedValue(returnValue ?? sampleLawyer);
  };

  const spyPrismaQueryRaw = (returnValue: any): jest.SpyInstance => {
    return jest.spyOn(prisma, "$queryRaw").mockResolvedValue(returnValue);
  };

  const spyCountryUpsert = (returnValue?: any): jest.SpyInstance => {
    const country = { id: "123TEST" };

    return jest
      .spyOn(prisma.country, "upsert")
      .mockResolvedValue(returnValue ?? country);
  };

  const spyLocationService = (returnValue?: any): jest.SpyInstance => {
    const location = {
      Geometry: {
        Point: [1, 1],
      },
    };
    return jest
      .spyOn(locationService, "geoLocatePlaceByText")
      .mockResolvedValue(returnValue ?? location);
  };

  describe("Create Lawyer", () => {
    test("createLawyer command correctly calls $queryRaw to check if list item already exists", async () => {
      const spyQueryRaw = spyPrismaQueryRaw([{ count: 1 }]);
      const spyCountry = spyCountryUpsert();

      try {
        await createLawyerListItem(LawyerWebhookData);
      } catch (error) {
        expect(error.message).toBe("Record already exists");
      }

      const expectedQuery = `
        SELECT COUNT(*) 
        FROM "ListItem" 
        WHERE "ListItem"."jsonData" @> '{"organisationName":"cartesian systems"}' 
        LIMIT 1
      `;
      expect(spyQueryRaw.mock.calls[0][0].replace(/\s/g, "")).toEqual(
        expectedQuery.replace(/\s/g, "")
      );
      expect(spyCountry).not.toHaveBeenCalled();
    });

    test("createLawyer command correctly calls country.upsert", async () => {
      spyPrismaQueryRaw([{ count: 0 }]);
      spyLocationService();
      spyLawyerCreate();
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
      spyPrismaQueryRaw([{ count: 0 }]);
      spyLocationService();
      spyCountryUpsert();
      const spy = spyLawyerCreate();

      try {
        await createLawyerListItem(LawyerWebhookData);
      } catch (error) {
        expect(error.message).toBe("Record already exists");
      }

      expect(spy).toHaveBeenCalledWith({
        data: {
          type: "lawyer",
          isApproved: false,
          isPublished: false,
          address: {
            create: {
              firstLine: "Cogito, Ergo Sum",
              secondLine: "Street",
              postCode: "123456",
              city: "Touraine",
              country: { connect: { id: "123TEST" } },
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
  });

  test("findPublishedLawyersPerCountry command is correct", async () => {
    const spyLocation = spyLocationService();
    const spyQueryRaw = jest.spyOn(prisma, "$queryRaw").mockResolvedValue([]);

    await findPublishedLawyersPerCountry({
      countryName: "france",
      region: "paris",
      legalAid: "yes",
      practiceArea: [],
    });

    const query = spyQueryRaw.mock.calls[0][0] as string;

    expect(spyLocation).toHaveBeenCalledWith("paris, France");

    expect(query.replace(/\s\s+/g, " ")).toEqual(
      `
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
        WHERE "ListItem"."type" = 'lawyer'
        AND "Country".name = 'France'
        AND "ListItem"."jsonData" @> '{"legalAid":true}'
        AND "ListItem"."isApproved" = true
        AND "ListItem"."isPublished" = true
        AND "ListItem"."isBlocked" = false
        ORDER BY distanceInMeters ASC
        LIMIT 20
    `.replace(/\s\s+/g, " ")
    );
  });

  test("approveLawyer command is correct", async () => {
    const spy = spyLawyerUpdate();
    const result = await approveListItem({ reference: "reference" });

    expect(spy).toHaveBeenCalledWith({
      where: {
        reference: "reference",
      },
      data: {
        isApproved: true,
      },
    });

    expect(result).toBe(sampleLawyer);
  });

  test("publishLawyer command is correct", async () => {
    const spy = spyLawyerUpdate();
    const result = await publishListItem({ reference: "reference" });

    expect(spy).toHaveBeenCalledWith({
      where: {
        reference: "reference",
      },
      data: {
        isPublished: true,
      },
    });

    expect(result).toBe(sampleLawyer);
  });

  test("blockLawyer command is correct", async () => {
    const spy = spyLawyerUpdate();
    const result = await blockListItem({ reference: "reference" });

    expect(spy).toHaveBeenCalledWith({
      where: {
        reference: "reference",
      },
      data: {
        isBlocked: true,
      },
    });

    expect(result).toBe(sampleLawyer);
  });
});
