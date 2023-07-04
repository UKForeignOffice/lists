import type { ServiceType } from "shared/types";
import type { BaseDeserialisedWebhookData as BD } from "shared/deserialiserTypes";
/**
 * Type describing a function that converts {@link BaseDeserialisedWebhookData} to {@link ListItemJsonData}
 * @example
 * ```
   const lawyersDeserialiser: WebhookDeserialiser<DeserialisedLawyerWebhookData, LawyerJsonData> = {...}
   // same as
   function lawyersDeserialiser(webhook: DeserialisedLawyerWebhookData): LawyerJsonData
 * ```
 */
export type WebhookDeserialiser<Input extends DeserialisedWebhookData, Output extends ListItemJsonData> = (
  webhookData: Input
) => {
  [Properties in keyof Output]: Output[Properties];
};

/**
 * Convenience type which maps ServiceType to the relevant WebhookDeserialiser<Input, Output>
 */
export interface WebhookDeserialisers {
  [ServiceType.lawyers]: WebhookDeserialiser<LawyersFormWebhookData, LawyerJsonData>;
  [ServiceType.funeralDirectors]: WebhookDeserialiser<FuneralDirectorFormWebhookData, FuneralDirectorJsonData>;
  [ServiceType.translatorsInterpreters]: WebhookDeserialiser<
    TranslatorInterpreterFormWebhookData,
    TranslatorInterpreterJsonData
  >;
}

export type BaseDeserialisedWebhookData = BD;

export interface LawyersFormWebhookData extends BaseDeserialisedWebhookData {
  type: ServiceType.lawyers;

  regions: string;
  areasOfLaw: string[];
  legalAid?: boolean;
  proBono?: boolean;
  addressCountry: string;
  representedBritishNationals: boolean;
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
  swornTranslations: string | boolean;
  swornInterpreter: string | boolean;
  translationSpecialties: string[];
}

export type DeserialisedWebhookData =
  | LawyersFormWebhookData
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
export type Deserialiser = Readonly<Record<ServiceType, WebhookDeserialiser<any, any>>>;

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
export type ListItemJsonData = LawyerJsonData | FuneralDirectorJsonData | TranslatorInterpreterJsonData;

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
