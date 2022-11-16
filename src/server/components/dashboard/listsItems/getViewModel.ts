import { ListItemGetObject, ServiceType } from "server/models/types";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import * as Types from "./types";
import { AddressDisplay, DeliveryOfServices, languages } from "server/services/metadata";
import { ListItem, Status } from "@prisma/client";
import { isEqual } from "lodash"
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
  listItem: ListItemJsonData,
  updatedFields?: string[] | null,
): Types.govukRow {
  const value = parseValue(field, listItem);
  const type = getValueMacroType(value, field);
  const htmlValues = ["link", "emailAddress", "phoneNumber", "multiLineText"];
  const valueKey = htmlValues.includes(type) ? "html" : "text";
  let actions = null;

  if (updatedFields?.includes(field as string)) {

    actions = {
      items: [
        {
          href: "#",
          html: "<strong class='govuk-tag'>Updated</strong>",
        },
      ],
    };
  }

  return {
    key: {
      text: fieldTitles[field] ?? "",
    },
    value: {
      [valueKey]: value,
    },
    actions,
    type: getValueMacroType(value, field),
  };
}

function removeEmpty(row: Types.govukRow): string | boolean {
  if (row.type === "boolean") return true;
  return row.value.text ?? row.value.html ?? false;
}

function jsonDataAsRows(
  fields: KeyOfJsonData[] | KeyOfJsonData,
  jsonData: ListItemJsonData,
  status: Status
): Types.govukRow[] {

  let updatedFields: string[] | null = null;

  if (!Array.isArray(fields)) {
    return [rowFromField(fields, jsonData)];
  }

  const dataUpdatedForAnnualReview = status === Status.CHECK_ANNUAL_REVIEW && jsonData.updatedJsonData;

  if (dataUpdatedForAnnualReview) {
    updatedFields = calculateUpdatedFields(jsonData);
  }

  return fields
    .map((field) => rowFromField(field, jsonData, updatedFields))
    .filter(removeEmpty);
}

function calculateUpdatedFields(listItem: ListItemJsonData): string[] {
  const { updatedJsonData, ...currentJsonData } = listItem;
  delete currentJsonData.updatedJsonData;
  delete currentJsonData.emailAddressToPublish;

  const currentJsonEntries = Object.entries(currentJsonData);

  const currentWithUpdatedFlag = currentJsonEntries.map((data) => {
    const [key, value] = data;

    if (!isEqual(updatedJsonData[key], value)) {
      return key;
    }
    return null;
  }).filter(Boolean);

  return currentWithUpdatedFlag as string[];
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
  return jsonDataAsRows(contactFields, listItem.jsonData, listItem.status);
}

function getOrganisationRows(listItem: ListItemGetObject): Types.govukRow[] {
  const { jsonData, status } = listItem;
  const type = listItem.type as ServiceType
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
    const languagesArray = listItem.jsonData.languagesProvided.map((item: string) => languages[item] || item);
    listItem.jsonData.languagesProvided = languagesArray;
  }

  return jsonDataAsRows(fieldsForType, jsonData, status);
}

function getAdminRows(listItem: ListItemGetObject): Types.govukRow[] {
  const baseFields: KeyOfJsonData[] = [
    "regulators",
    "emailAddress",
  ];
  return jsonDataAsRows(baseFields, listItem.jsonData, listItem.status);
}

export function getDetailsViewModel(
  listItem: ListItemGetObject | ListItem
): DetailsViewModel {
  const item = listItem as ListItemGetObject;
  const headerField = ServiceType.lawyers === listItem.type ? item.jsonData.contactName : item.jsonData.organisationName;

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
