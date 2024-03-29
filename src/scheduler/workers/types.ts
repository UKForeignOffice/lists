import { List } from "@prisma/client";

export interface Meta {
  /**
   * annual review reference for list (`List.jsonData.currentAnnualReview.reference`)
   */
  reference: string;
  weeksUntilUnpublish?: number;
  daysUntilUnpublish?: number;
  weeksSinceStart: number;
  parsedUnpublishDate: string;
  countryName: string;
}

interface CountryName {
  country: { name: string };
}

export type ListWithCountryName = List & CountryName;
