import { Address, Country, ListItem } from "server/models/types";

export interface ListItemWithAddressCountry extends ListItem {
  address: Address & {
    country: Country;
  };
}
