import { Address, Country, ListItem, ServiceType } from "server/models/types";
import {} from "server/components/formRunner";

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
