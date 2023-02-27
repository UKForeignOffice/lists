import { Address, ListItem } from "@prisma/client";

export interface Meta {
  /**
   * annual review reference for list (`List.jsonData.currentAnnualReview.reference`)
   */
  reference: string;

  /**
   * Weeks until unpublish. Used for debugging. added to `Event.jsonData.notes`.
   */
  weeksUntilUnpublish: number;
}

export type ListItemWithCountryName = ListItem & { address: Address & { country: { name: string } } };
