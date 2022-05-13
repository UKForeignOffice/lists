import { Address, Country, ListItem, ServiceType } from "server/models/types";
import {
  BaseDeserialisedWebhookData,
  CovidTestSupplierFormWebhookData,
  DeserialisedWebhookData,
} from "server/components/formRunner";

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

export enum TestType {
  Antigen = "Antigen",
  LAMP = "Loop-mediated Isothermal Amplification (LAMP)",
  PCR = "Polymerase Chain Reaction (PCR)",
}

export type TurnaroundTimeProperties = keyof Pick<
  CovidTestSupplierFormWebhookData,
  "turnaroundTimeAntigen" | "turnaroundTimeLamp" | "turnaroundTimePCR"
>;

export const turnaroundTimeProperties: Record<
  TestType,
  TurnaroundTimeProperties
> = {
  [TestType.Antigen]: "turnaroundTimeAntigen",
  [TestType.LAMP]: "turnaroundTimeLamp",
  [TestType.PCR]: "turnaroundTimePCR",
};

export type WebhookDeserialiser<T extends BaseDeserialisedWebhookData> = (
  webhookData: T
) => {
  [Properties in keyof T]: T[Properties];
};
