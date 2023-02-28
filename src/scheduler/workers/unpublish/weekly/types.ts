import { Address, List, ListItem } from "@prisma/client";

export interface Meta {
  /**
   * annual review reference for list (`List.jsonData.currentAnnualReview.reference`)
   */
  reference: string;

  /**
   * Weeks until unpublish. Used for debugging. added to `Event.jsonData.notes`.
   */
  weeksUntilUnpublish: number;

  parsedUnpublishDate: string;

  countryName: string;
}

export type ListItemWithCountryName = ListItem & { address: Address & { country: { name: string } } };
export type ListWithCountryName = List & { country: { name: string } };
