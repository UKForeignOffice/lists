import { toLower, startCase } from "lodash";

import { LawyersFormWebhookData } from "server/services/form-runner";
import * as locationService from "server/services/location";
import { prisma } from "../db/prisma-client";
import {
  approveLawyer,
  publishLawyer,
  blockLawyer,
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

describe("Lawyers Model:", () => {
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

  const spyLawyerFindFirst = (returnValue: any): jest.SpyInstance => {
    return jest
      .spyOn(prisma.listItem, "findFirst")
      .mockResolvedValue(returnValue);
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
    test("createLawyer command correctly calls findFirst", async () => {
      const spyFindFirst = spyLawyerFindFirst({});

      try {
        await createLawyerListItem(LawyerWebhookData);
      } catch (error) {
        expect(error.message).toBe("Record already exists");
      }

      expect(spyFindFirst).toHaveBeenCalledWith({
        where: {
          jsonData: {
            equals: {
              organisationName: LawyerWebhookData.organisationName.toLowerCase(),
            },
          },
          address: {
            country: {
              name: LawyerWebhookData.country,
            },
          },
        },
      });
    });

    test("createLawyer command correctly calls country.upsert", async () => {
      spyLawyerFindFirst(null);
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
      spyLawyerFindFirst(null);
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
              "Bankruptcy",
              "Corporate",
              "Criminal",
              "Employment",
              "Family",
              "Health",
              "Immigration",
              "Intellectual property",
              "International",
              "Maritime",
              "Personal injury",
              "Real estate",
              "Tax",
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
      country: "france",
      region: "paris",
      legalAid: "yes",
      practiceArea: [],
    });

    const query = spyQueryRaw.mock.calls[0][0] as string;

    expect(spyLocation).toHaveBeenCalledWith("paris, France");

    expect(query.includes(`ST_GeographyFromText('Point(1 1)')`)).toBe(true);

    expect(
      query.includes(
        `INNER JOIN "Address" ON "ListItem"."addressId" = "Address".id`
      )
    ).toBe(true);

    expect(
      query.includes(
        `INNER JOIN "Country" ON "Address"."countryId" = "Country".id`
      )
    ).toBe(true);

    expect(
      query.includes(
        `INNER JOIN "GeoLocation" ON "Address"."geoLocationId" = "GeoLocation".id`
      )
    ).toBe(true);

    expect(query.includes(`WHERE "Country".name = 'France'`)).toBe(true);
    expect(
      query.includes(`AND "ListItem"."jsonData" @> '{"legalAid":true}'`)
    ).toBe(true);
    expect(query.includes(`AND "ListItem"."isApproved" = true`)).toBe(true);
    expect(query.includes(`AND "ListItem"."isPublished" = true`)).toBe(true);
    expect(query.includes(`AND "ListItem"."isBlocked" = false`)).toBe(true);
    expect(query.includes(`ORDER BY distanceInMeters ASC`)).toBe(true);
    expect(query.includes(`LIMIT 20`)).toBe(true);
  });

  test("approveLawyer command is correct", async () => {
    const spy = spyLawyerUpdate();
    const result = await approveLawyer("reference");

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
    const result = await publishLawyer("reference");

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
    const result = await blockLawyer("reference");

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
