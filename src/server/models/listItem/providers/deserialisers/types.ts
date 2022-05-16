import { ServiceType } from "server/models/types";

/**
 * Type describing a function that converts {@link BaseDeserialisedWebhookData}  to {}
 * @example
 * ```
 *  const lawyersDeserialiser: WebhookDeserialiser<DeserialisedLawyerWebhookData> = {}
 *  // same as
 *  function lawyersDeserialiser<T extends BaseDeserialisedWebhookData>(webhook: T): LawyersFormWebhookData {}
 * ```
 */
export type WebhookDeserialiser<T extends DeserialisedWebhookData = any> = (
  webhookData: T
) => {
  [Properties in keyof T]: T[Properties];
};

export interface BaseDeserialisedWebhookData {
  /**
   * address fields are also stored in `ListItem.jsonData`
   */
  country: string;
  addressCountry: string; // TODO:- remove
  "address.firstLine": string;
  "address.secondLine"?: string;
  city: string;
  postCode: string;

  size: string;
  speakEnglish: boolean;
  regulators: string;
  organisationName: string;
  websiteAddress?: string;

  contactName: string;
  emailAddress: string;
  publishEmail: string;
  publicEmailAddress?: string;
  phoneNumber: string;
  emergencyPhoneNumber?: string;
  declaration: string[];
  type: ServiceType;

  /**
   * At time of deserialising the {@link WebhookData} to BaseDeserialisedWebhookData,
   * additional unique properties for a supplier type (e.g. {@link LawyersFormWebhookData}) will be unknown.
   */
  [additionalProps: string]: any;
}

export interface LawyersFormWebhookData extends BaseDeserialisedWebhookData {
  type: ServiceType.lawyers;

  regions: string;
  areasOfLaw: string[];
  legalAid?: boolean;
  proBono?: boolean;
  addressCountry: string;
  representedBritishNationals: boolean;
}

export interface CovidTestSupplierFormWebhookData
  extends BaseDeserialisedWebhookData {
  type: ServiceType.covidTestProviders;

  isQualified: boolean;
  affiliatedWithRegulatoryAuthority: boolean;
  regulatoryAuthority: string;
  meetUKstandards: boolean;
  provideResultsInEnglishFrenchSpanish: boolean;
  provideTestResultsIn72Hours: boolean;
  locationName: string;
  providedTests: string;
  turnaroundTimeAntigen: string;
  turnaroundTimeLamp: string;
  turnaroundTimePCR: string;
  resultsFormat: string;
  resultsReadyFormat: string;
  bookingOptions: string;
}

export type DeserialisedWebhookData =
  | LawyersFormWebhookData
  | CovidTestSupplierFormWebhookData;

export type LawyerJsonData = LawyersFormWebhookData;

export enum TestType {
  Antigen = "Antigen",
  LAMP = "Loop-mediated Isothermal Amplification (LAMP)",
  PCR = "Polymerase Chain Reaction (PCR)",
}

export type TurnaroundTimeProperties = keyof Pick<
  CovidTestSupplierFormWebhookData,
  "turnaroundTimeAntigen" | "turnaroundTimeLamp" | "turnaroundTimePCR"
>;

export type ProvidedTests = {
  [property in TurnaroundTimeProperties]: {
    type: property;
    turnaroundTime: number;
  };
};

export const turnaroundTimeProperties: Record<
  TestType,
  TurnaroundTimeProperties
> = {
  [TestType.Antigen]: "turnaroundTimeAntigen",
  [TestType.LAMP]: "turnaroundTimeLamp",
  [TestType.PCR]: "turnaroundTimePCR",
};

export type CovidTestSupplierJsonData = Omit<
  CovidTestSupplierFormWebhookData,
  TurnaroundTimeProperties
> & {
  providedTests: ProvidedTests;
  fastestTurnaround: number;
};

export type ListItemJsonData = LawyerJsonData | CovidTestSupplierJsonData;

export type Deserialiser = Readonly<Record<ServiceType, WebhookDeserialiser>>;

/**
 * converts {@link DeserialisedWebhookData} to {@link Questions[]}
 */
export interface SerialisedWebhookData<T extends ListItemJsonData> {
  // iterates through T. (i.e. "for each `property` in T")
  questions: {
    [Property in keyof T]: {
      field: {
        key: Property; // remap the property to key e.g. `{ key: "proBono" }`
        value: T[Property]; // remap the type of T[Property] to value.
      };
    };
  };
}
