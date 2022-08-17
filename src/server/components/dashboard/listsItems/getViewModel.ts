import { ListItemGetObject, ServiceType } from "server/models/types";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import * as Types from "./types";
import { AddressDisplay, DeliveryOfServices, languages } from "server/services/metadata";

interface DetailsViewModel {
  organisation: Types.govukSummaryList;
  contact: Types.govukSummaryList;
  adminUseOnly: Types.govukSummaryList;

  [key: string]: Types.govukSummaryList;
}

/**
 * TODO: implement i18n
 */
const fieldTitles: { [prop: string]: string } = {
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

function parseValue<T extends KeyOfJsonData>(
  field: T,
  jsonData: ListItemJsonData
): ListItemJsonData[T] {
  /**
   * if a field needs to be parsed differently, add a statement here.
   * TODO: if there are a lot of cases, refactor into an object!
   */
  if (field === "address") {
    return [
      jsonData["address.firstLine"]?.trim() ?? "",
      jsonData["address.secondLine"]?.trim() ?? "",
      jsonData.postCode?.trim() ?? "",
      jsonData.city?.trim() ?? "",
    ].filter((line) => line)
      .join(`\n`);
  }
  return jsonData?.[field];
  }

function rowFromField(
  field: KeyOfJsonData,
  listItem: ListItemJsonData
): Types.govukRow {
  const value = parseValue(field, listItem);
  const type = getValueMacroType(value, field);
  const htmlValues = ["link", "emailAddress", "phoneNumber", "multiLineText"];
  const valueKey = htmlValues.includes(type) ? "html" : "text";
  return {
    key: {
      text: fieldTitles[field] ?? "",
    },
    value: {
      [valueKey]: value,
    },
    type: getValueMacroType(value, field),
  };
}

function removeEmpty(row: Types.govukRow): string | boolean {
  if (row.type === "boolean") return true;
  return row.value.text ?? row.value.html ?? false;
}

function jsonDataAsRows(
  fields: KeyOfJsonData[] | KeyOfJsonData,
  jsonData: ListItemJsonData
): Types.govukRow[] {
  if (!Array.isArray(fields)) {
    return [rowFromField(fields, jsonData)];
  }
  return fields
    .map((field) => rowFromField(field, jsonData))
    .filter(removeEmpty);
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
  const { jsonData, type } = listItem;
  const baseFields: KeyOfJsonData[] = ["contactName", "size", "regions"];
  const fields = {
    [ServiceType.lawyers]: [
      "organisationName",
      "size",
      "regions",
      "areasOfLaw",
      "legalAid",
      "proBono",
      "representedBritishNationals",
    ],
    [ServiceType.covidTestProviders]: [...baseFields],
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
      "languagesProvided",
      "languagesSummary",
      "translationSpecialties",
      "interpreterServices",
      "deliveryOfServices",
      "representedBritishNationals",
    ],
  };

  const fieldsForType = fields[type] ?? baseFields;

  if (type === ServiceType.translatorsInterpreters && listItem.jsonData.deliveryOfServices) {
    listItem.jsonData.deliveryOfServices = DeliveryOfServices[listItem.jsonData.deliveryOfServices];
  }
  if (type === ServiceType.translatorsInterpreters && listItem.jsonData.languagesProvided) {
    const languagesArray = listItem.jsonData.languagesProvided.map((item: string) => {
      return languages[item] || item;
    });
    listItem.jsonData.languagesProvided = languagesArray;
  }

  return jsonDataAsRows(fieldsForType, jsonData);
}

function getAdminRows(listItem: ListItemGetObject): Types.govukRow[] {
  const baseFields: KeyOfJsonData[] = [
    "regulators",
    "emailAddress",
  ];
  return jsonDataAsRows(baseFields, listItem.jsonData);
}

export function getDetailsViewModel(
  listItem: ListItemGetObject
): DetailsViewModel {
  const headerField = ServiceType.lawyers === listItem.type ? listItem.jsonData.contactName : listItem.jsonData.organisationName;

  return {
    organisation: {
      rows: getOrganisationRows(listItem),
    },
    contact: {
      title: "Contact details",
      rows: getContactRows(listItem),
    },
    adminUseOnly: {
      title: "Admin use only",
      rows: getAdminRows(listItem),
    },
    headerField,
  };
}
