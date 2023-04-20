import { ServiceType } from "server/models/types";

/**
 * Type describing a function that converts {@link BaseDeserialisedWebhookData} to {@link ListItemJsonData}
 * @example
 * ```
   const lawyersDeserialiser: WebhookDeserialiser<DeserialisedLawyerWebhookData, LawyerJsonData> = {...}
   // same as
   function lawyersDeserialiser(webhook: DeserialisedLawyerWebhookData): LawyerJsonData
 * ```
 */
export type WebhookDeserialiser<
  Input extends DeserialisedWebhookData,
  Output extends ListItemJsonData
> = (webhookData: Input) => {
  [Properties in keyof Output]: Output[Properties];
};

/**
 * Convenience type which maps ServiceType to the relevant WebhookDeserialiser<Input, Output>
 */
export interface WebhookDeserialisers {
  [ServiceType.lawyers]: WebhookDeserialiser<
    LawyersFormWebhookData,
    LawyerJsonData
  >;
  [ServiceType.funeralDirectors]: WebhookDeserialiser<
    FuneralDirectorFormWebhookData,
    FuneralDirectorJsonData
    >;
  [ServiceType.covidTestProviders]: WebhookDeserialiser<
    CovidTestSupplierFormWebhookData,
    CovidTestSupplierJsonData
  >;
  [ServiceType.translatorsInterpreters]: WebhookDeserialiser<
    TranslatorInterpreterFormWebhookData,
    TranslatorInterpreterJsonData
  >;
}

export interface BaseDeserialisedWebhookData {
  /**
   * address fields are also stored in `ListItem.jsonData` and `Address`
   */
  country: string;
  addressCountry?: string; // TODO:- remove
  "address.firstLine": string;
  "address.secondLine"?: string;
  city: string;
  postCode?: string;

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
  contactPhoneNumber?: string;
  declaration: string[];
  type: ServiceType;
  updatedJsonData?: Omit<BaseDeserialisedWebhookData, "updatedJsonData">

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

export interface FuneralDirectorFormWebhookData extends BaseDeserialisedWebhookData {
  type: ServiceType.translatorsInterpreters;

  regions: string;
  addressCountry: string;
  representedBritishNationals: boolean;
  localServicesProvided: string[];
  repatriation: boolean;
  repatriationServicesProvided: string[];
  religiousCulturalServicesProvided: string;
  languagesSpoken: string;
}

export interface TranslatorInterpreterFormWebhookData extends BaseDeserialisedWebhookData {
  type: ServiceType.translatorsInterpreters;

  addressDisplay: string;
  deliveryOfServices: string[];
  interpretationInACourt: boolean;
  interpreterServices: string[];
  languagesProvided: string[];
  memberOfProfessionalAssociations: boolean;
  regions: string;
  representedBritishNationals: boolean;
  servicesProvided: string[];
  swornTranslations: string;
  swornInterpreter: string;
  translationSpecialties: string[];
}

export type DeserialisedWebhookData =
  | LawyersFormWebhookData
  | CovidTestSupplierFormWebhookData
  | FuneralDirectorFormWebhookData
  | TranslatorInterpreterFormWebhookData;

/**
 * Describes the {@link DESERIALISER} const. Since it is a Record type,
 * the resulting object MUST implement all members of {@link ServiceType}.
 * i.e. whenever a new {@link ServiceType} is added, and {@link DESERIALISER} has not been added, typescript should complain!
 *
 * @example
 * ```
   const DESERIALISER = {
     [ServiceType]: WebhookDeserialiser<Input, Output>
   }
 * ```
 */
export type Deserialiser = Readonly<
  Record<ServiceType, WebhookDeserialiser<any, any>>
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

export interface ProvidedTest {
  type: TestType;
  turnaroundTime: number;
}

export type CovidTestSupplierJsonData = Omit<
  CovidTestSupplierFormWebhookData,
  TurnaroundTimeProperties
> & {
  providedTests: ProvidedTest[];
  fastestTurnaround: number;
  resultsFormat: string[];
  resultsReadyFormat: string[];
  bookingOptions: string[];
};

export type FuneralDirectorJsonData = FuneralDirectorFormWebhookData;

export type LawyerJsonData = LawyersFormWebhookData;

export type TranslatorInterpreterJsonData = TranslatorInterpreterFormWebhookData;

/**
 * when serviceTypeJsonData does not match serviceTypeWebhookData, you must ensure that:
 * - your deserialiser (turns formRunner data to listItem.jsonData, i.e. at ingestion points) correctly returns a value that matches serviceTypeJsonData
 * - your serialiser (turns listItem.jsonData to formRunner data, i.e. for requesting a change) correctly returns a value that matches serviceTypeWebhookData
 *
 * It is also important to note that in the case that a serviceTypeJsonData and serviceTypeWebhookData do not match, it will be a source of code complexity.
 * It will mean that your code can not be handled in a "generic" way, and you will have to write a deserialiser and serialiser.
 * The deserialised and serialised types should match as closely as possible.
 */
export type ListItemJsonData = LawyerJsonData | CovidTestSupplierJsonData | FuneralDirectorJsonData | TranslatorInterpreterJsonData;

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
