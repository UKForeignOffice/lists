import type { ListItemGetObject } from "server/models/types";
import { ServiceType } from "shared/types";
import type { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import type * as Types from "./types";
import { AddressDisplay, DeliveryOfServices, languages } from "server/services/metadata";
import type { ListItem } from "@prisma/client";

interface DetailsViewModel {
  organisation: Types.govukSummaryList;
  contact: Types.govukSummaryList;
  adminUseOnly: Types.govukSummaryList;
  headerField: string;
}

/**
 * TODO: implement i18n
 */
export const fieldTitles: Record<string, string> = {
  /**
   * used to convert fieldNames to a user-facing string
   */
  contactName: "Contact name",
  address: "Address",
  areasOfLaw: "Legal expertise",
  emailAddress: "Email - private",
  contactPhoneNumber: "Emergency number",
  legalAid: "Legal aid",
  organisationName: "Company",
  phoneNumber: "Telephone",
  proBono: "Pro bono",
  publicEmailAddress: "Email address for GOV.UK",
  emailAddressToPublish: "Email address for GOV.UK",
  regions: "Regions",
  regulators: "Professional associations",
  representedBritishNationals: "Provided services to British nationals before",
  size: "Company size",
  speakEnglish: "English language service",
  websiteAddress: "Website",
  repatriation: "Repatriation",
  localServicesProvided: "Local services",
  repatriationServicesProvided: "Repatriation services",
  religiousCulturalServicesProvided: "Religious and cultural services",
  languagesSpoken: "Languages spoken in addition to English",
  servicesProvided: "Services provided",
  languagesProvided: "Languages translated or interpreted",
  addressDisplay: "How to display address on GOV.UK",
  translationSpecialties: "Translation services",
  interpreterServices: "Interpretation services",
  deliveryOfServices: "How services are carried out",
  swornTranslations: "Provides sworn or certified translation",
  swornInterpretations: "Provides sworn interpretation",
};

type KeyOfJsonData = keyof ListItemJsonData;

const fieldCategory: Record<Types.NonPrimitiveMacros, KeyOfJsonData[]> = {
  multiLineText: ["regulators", "address"],
  emailAddress: ["publicEmailAddress", "emailAddress"],
  link: ["websiteAddress"],
  phoneNumber: ["phoneNumber", "contactPhoneNumber"],
};

function getValueMacroType(value: any, field: KeyOfJsonData): Types.Macro {
  /**
   * Used to get the right macro, in case the row needs to be displayed differently,
   * e.g. as an `<a>` tag.
   */

  if (fieldCategory.multiLineText.includes(field)) {
    return "multiLineText";
  }

  if (fieldCategory.emailAddress.includes(field)) {
    return "emailAddress";
  }

  if (fieldCategory.link.includes(field)) {
    return "link";
  }

  if (fieldCategory.phoneNumber.includes(field)) {
    return "phoneNumber";
  }

  if (typeof value === "boolean" || value === "Yes" || value === "No") {
    return "boolean";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  return "string";
}

function parseValue<T extends KeyOfJsonData>(field: T, jsonData: ListItemJsonData): ListItemJsonData[T] {
  /**
   * if a field needs to be parsed differently, add a statement here.
   * TODO: if there are a lot of cases, refactor into an object!
   */
  if (field === "address") {
    return [
      jsonData.updatedJsonData?.["address.firstLine"] ?? jsonData["address.firstLine"]?.trim() ?? "",
      jsonData.updatedJsonData?.["address.secondLine"] ?? jsonData["address.secondLine"]?.trim() ?? "",
      jsonData.updatedJsonData?.postCode ?? jsonData.postCode?.trim() ?? "",
      jsonData.updatedJsonData?.city ?? jsonData.city?.trim() ?? "",
    ]
      .filter((line) => line)
      .join(`\n`);
  }

  if (field === "languagesProvided") {
    const languagesProvided = jsonData.updatedJsonData?.languagesProvided ?? jsonData.languagesProvided;
    return languagesProvided.map((item: string) => languages[item]);
  }

  return jsonData.updatedJsonData?.[field] ?? jsonData[field];
}

function hasUpdate(field: KeyOfJsonData, listItem: ListItemJsonData) {
  const updatedJsonData = listItem?.updatedJsonData;
  if (!updatedJsonData) {
    return false;
  }
  if (field === "address") {
    const addressFields = ["address.firstLine", "address.secondLine", "postCode", "city"];
    const addressFieldsHasChange =
      addressFields.findIndex((addressField) => {
        // TODO: Object.hasOwn is recommended but is not currently supported by tsc.
        // eslint-disable-next-line no-prototype-builtins
        return updatedJsonData?.hasOwnProperty?.(addressField) ?? false;
      }) !== -1;
    return addressFieldsHasChange;
  }

  // TODO: Object.hasOwn is recommended but is not currently supported by tsc.
  // eslint-disable-next-line no-prototype-builtins
  return updatedJsonData?.hasOwnProperty?.(field);
}

function rowFromField(field: KeyOfJsonData, listItem: ListItemJsonData): Types.govukRow {
  const value = parseValue(field, listItem);
  const type = getValueMacroType(value, field);
  const htmlValues = ["link", "emailAddress", "phoneNumber", "multiLineText"];
  const valueKey = htmlValues.includes(type) ? "html" : "text";

  const fieldHasUpdate = hasUpdate(field, listItem);

  const updateTag = { html: "<strong class='govuk-tag'>Updated</strong>" };

  return {
    key: {
      text: fieldTitles[field] ?? "",
    },
    value: {
      [valueKey]: value,
    },
    ...(fieldHasUpdate && {
      actions: { items: [updateTag] },
      hasUpdate: fieldHasUpdate,
    }),
    type: getValueMacroType(value, field),
  };
}

function removeEmpty(row: Types.govukRow): string | boolean {
  if (row.type === "boolean") return true;
  return row.value.text ?? row.value.html ?? false;
}

function jsonDataAsRows(fields: KeyOfJsonData[] | KeyOfJsonData, jsonData: ListItemJsonData): Types.govukRow[] {
  if (!Array.isArray(fields)) {
    return [rowFromField(fields, jsonData)];
  }
  return fields.map((field) => rowFromField(field, jsonData)).filter(removeEmpty);
}

function getContactRows(listItem: ListItemGetObject): Types.govukRow[] {
  if (listItem.jsonData.publicEmailAddress) {
    listItem.jsonData.emailAddressToPublish = listItem.jsonData.publicEmailAddress;
  } else {
    listItem.jsonData.emailAddressToPublish = listItem.jsonData.emailAddress;
  }
  const contactFields: KeyOfJsonData[] = [
    "contactName",
    "address",
    "addressDisplay",
    "emailAddressToPublish",
    "phoneNumber",
    "contactPhoneNumber",
    "websiteAddress",
  ];

  if (listItem.type === ServiceType.translatorsInterpreters && listItem.jsonData.addressDisplay) {
    listItem.jsonData.addressDisplay = AddressDisplay[listItem.jsonData.addressDisplay];
  }

  return jsonDataAsRows(contactFields, listItem.jsonData);
}

function getOrganisationRows(listItem: ListItemGetObject): Types.govukRow[] {
  const { jsonData } = listItem;
  const type = listItem.type as ServiceType;
  const baseFields: KeyOfJsonData[] = ["organisationName", "contactName", "size", "regions"];
  const fields = {
    [ServiceType.lawyers]: [...baseFields, "areasOfLaw", "legalAid", "proBono", "representedBritishNationals"],
    [ServiceType.funeralDirectors]: [
      ...baseFields,
      "repatriation",
      "languagesSpoken",
      "localServicesProvided",
      "representedBritishNationals",
      "repatriationServicesProvided",
      "religiousCulturalServicesProvided",
    ],
    [ServiceType.translatorsInterpreters]: [
      ...baseFields,
      "servicesProvided",
      "swornTranslations",
      "swornInterpretations",
      "languagesProvided",
      "languagesSummary",
      "translationSpecialties",
      "interpreterServices",
      "deliveryOfServices",
      "representedBritishNationals",
    ],
  };

  const fieldsForType = fields[type] ?? baseFields;

  if (type === ServiceType.translatorsInterpreters) {
    return formatRowsForTranslators(fieldsForType, listItem);
  }
  return jsonDataAsRows(fieldsForType, jsonData);
}

function formatRowsForTranslators(
  fields: string[] | Array<string | number>,
  listItem: ListItemGetObject
): Types.govukRow[] {
  const { jsonData } = listItem;

  if (jsonData.deliveryOfServices) {
    jsonData.deliveryOfServices = DeliveryOfServices[jsonData.deliveryOfServices];
  }

  jsonData.swornInterpretations ??= jsonData.updatedJsonData?.swornInterpretations;
  jsonData.swornTranslations ??= jsonData.updatedJsonData?.swornTranslations;

  return jsonDataAsRows(fields, jsonData);
}

function getAdminRows(listItem: ListItemGetObject): Types.govukRow[] {
  const baseFields: KeyOfJsonData[] = ["regulators", "emailAddress"];
  return jsonDataAsRows(baseFields, listItem.jsonData);
}

export function getDetailsViewModel(listItem: ListItemGetObject | ListItem): DetailsViewModel {
  const item = listItem as ListItemGetObject;
  const headerField =
    ServiceType.lawyers === listItem.type ? item.jsonData.contactName : item.jsonData.organisationName;

  return {
    organisation: {
      rows: getOrganisationRows(item),
    },
    contact: {
      title: "Contact details",
      rows: getContactRows(item),
    },
    adminUseOnly: {
      title: "Admin use only",
      rows: getAdminRows(item),
    },
    headerField,
  };
}
