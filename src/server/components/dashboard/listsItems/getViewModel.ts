import { ListItem, ListItemGetObject, ServiceType } from "server/models/types";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";

interface govukRow {
  key: {
    text: string;
  };
  value: {
    text?: string;
    html?: string;
    type?: "boolean" | "link" | "emailAddress" | "array";
  };
}

interface govukSummaryList {
  title?: string;
  rows: govukRow[];
}

type ListItemsViewModel = Partial<ListItemGetObject> & {
  details: {
    organisation: govukSummaryList;
    contact: govukSummaryList;
    adminUseOnly: govukSummaryList;

    [key: string]: govukSummaryList;
  };
};

/**
 * TODO: implement i18n
 */
const fieldTitles: { [prop: string]: string } = {
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

function getValueHelperType(value, field) {
  /**
   * Used to get the right macro, in case the row needs to be displayed slightly differently
   */
  if (["publicEmailAddress", "emailAddress"].includes(field)) {
    return "emailAddress";
  }

  if (["websiteAddress"].includes(field)) {
    return "externalLink";
  }

  if (["phoneNumber"].includes(field)) {
    return "phoneNumber";
  }

  if (typeof value === "boolean") {
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
): govukRow {
  const value = listItem?.[field];
  return {
    key: {
      text: fieldTitles[field] ?? "",
    },
    value: {
      text: value,
    },
  };
}

function removeEmpty(row: govukRow): string | boolean {
  return row.value.text ?? false;
}

function jsonDataAsRows(
  fields: KeyOfJsonData[] | KeyOfJsonData,
  jsonData: ListItemJsonData
): govukRow[] {
  if (!Array.isArray(fields)) {
    return [rowFromField(fields, jsonData)];
  }
  return fields
    .map((field) => rowFromField(field, jsonData))
    .filter(removeEmpty);
}

function getContactRows(listItem: ListItemGetObject) {
  const contactFields: KeyOfJsonData[] = [
    "phoneNumber",
    "email",
    "emergencyPhoneNumber",
    "websiteAddress",
  ];

  return jsonDataAsRows(contactFields, listItem.jsonData);
}

function getOrganisationRows(listItem: ListItemGetObject) {
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

function getAdminRows(listItem: ListItemGetObject) {
  const baseFields: KeyOfJsonData[] = [
    "emailAddress",
    "regulators",
    "speakEnglish",
    "emergencyPhoneNumber",
  ];
  return jsonDataAsRows(baseFields, listItem.jsonData);
}

export function getViewModel(listItem: ListItemGetObject): ListItemsViewModel {
  const vm: ListItemsViewModel = {
    details: {
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
    },
  };

  console.log("vm", vm);
  return vm;
}
