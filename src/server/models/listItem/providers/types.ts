import { Address, Country } from "server/models/types";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { Prisma } from "@prisma/client";

export type ListItemWithAddressCountry = Prisma.ListItemGetPayload<{
  include: {
    address: {
      include: {
        country: true;
      };
    };
  };
}>;

export interface ListItemWithJsonData extends ListItemWithAddressCountry {
  address: Address & {
    country: Country;
  };
  jsonData: ListItemJsonData;
}

export enum EVENTS {
  UPDATED_BY_USER = "User updated details",
}

export type UpdatableAddressFields = Partial<
  Pick<Address, "firstLine" | "secondLine" | "city" | "postCode">
>;

export interface LanguageRow {
  key: {
    text: string,
    classes: string,
  },
  value: {
    text: string,
    classes: string,
  },
  actions: {
    items: [{
      href: string,
      text: string,
      visuallyHiddenText: string
    }]
  }
};

export interface LanguageRows {
  rows: LanguageRow[],
}
