import { ListItemGetObject, ServiceType } from "server/models/types";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import * as Types from "./types";

type DetailsViewModel = Partial<ListItemGetObject> & {
  organisation: Types.govukSummaryList;
  contact: Types.govukSummaryList;
  adminUseOnly: Types.govukSummaryList;

  [key: string]: Types.govukSummaryList;
};

/**
 * TODO: implement i18n
 */
const fieldTitles: { [prop: string]: string } = {
  /**
   * used to convert fieldNames to a user-facing string
   */
  address: "Address",
  areasOfLaw: "Legal expertise",
  emailAddress: "Email - private",
  emergencyPhoneNumber: "Emergency number",
  legalAid: "Legal aid",
  organisationName: "Company",
  phoneNumber: "Telephone",
  proBono: "Pro bono",
  publicEmailAddress: "Email - public",
  regions: "Regions",
  regulators: "Regulators",
  representedBritishNationals: "Represented BNs",
  size: "Company size",
  speakEnglish: "English language service",
  websiteAddress: "Website",
};

type KeyOfJsonData = keyof ListItemJsonData;

function getValueMacroType(value: any, field: KeyOfJsonData): Types.Macro {
  /**
   * Used to get the right macro, in case the row needs to be displayed slightly differently
   */
  const fieldCategory: Record<Types.NonPrimitiveMacros, KeyOfJsonData[]> = {
    multiLineText: ["regulators", "address"],
    emailAddress: ["publicEmailAddress", "emailAddress"],
    link: ["websiteAddress"],
    phoneNumber: ["phoneNumber", "emergencyPhoneNumber"],
  };

  if (fieldCategory.multiLineText.includes(field)) {
    return "emailAddress";
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

function rowFromField(
  field: KeyOfJsonData,
  listItem: ListItemJsonData
): Types.govukRow {
  const value = listItem?.[field];
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
  return row.value.text ?? false;
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
  const contactFields: KeyOfJsonData[] = [
    "phoneNumber",
    "email",
    "emergencyPhoneNumber",
    "websiteAddress",
  ];

  return jsonDataAsRows(contactFields, listItem.jsonData);
}

function getOrganisationRows(listItem: ListItemGetObject): Types.govukRow[] {
  const { jsonData, type } = listItem;
  const baseFields: KeyOfJsonData[] = ["organisationName", "size", "regions"];
  const fields = {
    [ServiceType.lawyers]: [
      ...baseFields,
      "areasOfLaw",
      "legalAid",
      "proBono",
      "representedBritishNationals",
    ],
    [ServiceType.covidTestProviders]: [...baseFields],
  };

  const fieldsForType = fields[type] ?? baseFields;

  return jsonDataAsRows(fieldsForType, jsonData);
}

function getAdminRows(listItem: ListItemGetObject): Types.govukRow[] {
  const baseFields: KeyOfJsonData[] = [
    "emailAddress",
    "regulators",
    "speakEnglish",
    "emergencyPhoneNumber",
  ];
  return jsonDataAsRows(baseFields, listItem.jsonData);
}

export function getDetailsViewModel(
  listItem: ListItemGetObject
): DetailsViewModel {
  return {
    organisation: {
      rows: getOrganisationRows(listItem),
    },
    adminUseOnly: {
      title: "Admin use only",
      rows: getAdminRows(listItem),
    },
    contact: {
      title: "Contact details",
      rows: getContactRows(listItem),
    },
  };
}
