import { Address, ListItem } from "@prisma/client";

export interface Meta {
  reference: string;
  weeksUntilUnpublish: number;
}

export type ListItemWithCountryName = ListItem & { address: Address & { country: { name: string } } };
