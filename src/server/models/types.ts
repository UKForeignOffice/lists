import Prisma from "@prisma/client";
import { countriesList } from "server/services/metadata";

export type CountriesWithData = Extract<
  CountryName,
  "Thailand" | "France" | "Italy" | "Spain"
>;
export type CountryName = typeof countriesList[number]["value"];
export type Point = number[];
export type Lawyer = Prisma.Lawyer;
