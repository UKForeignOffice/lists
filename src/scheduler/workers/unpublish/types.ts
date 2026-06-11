import type { List } from "@prisma/client";

interface CountryName {
  country: { name: string };
}
export type ListWithCountryName = List & CountryName;
