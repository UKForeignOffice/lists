import type { ServiceType } from "shared/types";

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
  updatedJsonData?: Omit<BaseDeserialisedWebhookData, "updatedJsonData">;

  /**
   * At time of deserialising the {@link WebhookData} to BaseDeserialisedWebhookData,
   * additional unique properties for a supplier type (e.g. {@link LawyersFormWebhookData}) will be unknown.
   */
  [additionalProps: string]: any;
}
