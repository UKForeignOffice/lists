import Prisma from "@prisma/client";
import { countriesList } from "server/services/metadata";

export type CountriesWithData = Extract<
  CountryName,
  "Thailand" | "France" | "Italy" | "Spain"
>;
export type CountryName = typeof countriesList[number]["value"];
export type Point = number[];
export type Lawyer = Prisma.Lawyer;
export type Address = Prisma.Address;

export interface LawyerCreateObject {
  contactName: string;
  lawFirmName: string;
  telephone: string;
  email: string;
  website: string;
  description?: string;
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
  isApproved: boolean;
  isPublished: boolean;
}
