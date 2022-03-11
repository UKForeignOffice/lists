import { Address, Country, ListItem } from "server/models/types";

export interface ListItemWithAddressCountry extends ListItem {
  address: Address & {
    country: Country;
  };
}

export enum EVENTS {
  UPDATED_BY_USER = "User updated details",
}

export type UpdatableAddressFields = Pick<
  Address,
  "firstLine" | "secondLine" | "city" | "postCode"
>;
