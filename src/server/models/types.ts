import * as PrismaClient from "@prisma/client";
import { countriesList } from "server/services/metadata";

export type CountriesWithData = Extract<
  CountryName,
  "Thailand" | "France" | "Italy" | "Spain"
>;
export type CountryName = typeof countriesList[number]["value"];
export type Point = number[];
export type Address = PrismaClient.Address;
export type Country = PrismaClient.Country;
export type Lawyer = PrismaClient.Lawyer;

interface LawyerExtendedProfile extends PrismaClient.Prisma.JsonObject {
  regulatoryAuthority?: string;
  outOfHours?: {
    telephone?: string;
    email?: string;
    address?: {
      firsLine: string;
      secondLine?: string;
      postCode: string;
      city: string;
    };
  };
}

export interface LawyerCreateObject {
  contactName: string;
  lawFirmName: string;
  telephone: string;
  email: string;
  website: string;
  address: {
    create: {
      firsLine: string;
      secondLine?: string;
      postCode: string;
      city: string;
      country: {
        connect: {
          id: number;
        };
      };
      geoLocationId?: number;
    };
  };
  legalPracticeAreas: {
    connectOrCreate: Array<{
      where: {
        name: string;
      };
      create: {
        name: string;
      };
    }>;
  };
  regionsServed?: string;
  legalAid: boolean;
  proBonoService: boolean;
  extendedProfile: LawyerExtendedProfile;
  isApproved: boolean;
  isPublished: boolean;
}
