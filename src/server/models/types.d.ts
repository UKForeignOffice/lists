import { lawyer } from "@prisma/client";
import { countriesList } from "services/metadata"

export type CountriesWithData = Extract<CountryName, "Thailand" | "France" | "Italy" | "Spain">;
export type CountryName = typeof countriesList[number]["text"];
export type Point = number[];
export type Lawyer = lawyer;
