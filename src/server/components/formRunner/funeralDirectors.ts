import { FuneralDirectorListItemGetObject, ServiceType } from "server/models/types";
import { Field, Question } from "server/components/formRunner/types";
import { parseJsonFormData } from "server/components/formRunner/helpers";
import { get } from "lodash";

// TODO:- use type mapping or keyof operator instead of simple object type
/**
 * Maps {@link LawyersFormWebhookData} properties to a ListItem.
 * @example
 * To get the organisationName from a `ListItem`, `get(listItem, formRunnerFields.organisationName)`
 * is equivalent to `get(listItem, "jsonData.organisationName")`
 * is equivalent to `listItem.jsonData.organisationName`.
 */
const FormRunnerFields: { [key: string]: string } = {
  speakEnglish: "jsonData.speakEnglish",
  contactName: "jsonData.contactName",
  organisationName: "jsonData.organisationName",
  "address.firstLine": "jsonData['address.firstLine']",
  "address.secondLine": "jsonData['address.firstLine']",
  city: "jsonData.city",
  postCode: "jsonData.postCode",
  addressCountry: "address.country.name",
  websiteAddress: "jsonData.websiteAddress",
  emailAddress: "jsonData.emailAddress",
  publishEmail: "jsonData.publishEmail",
  representedBritishNationals: "jsonData.representedBritishNationals",
  phoneNumber: "jsonData.phoneNumber",
  contactPhoneNumber: "jsonData.contactPhoneNumber",
  regulators: "jsonData.regulators",
  declaration: "jsonData.declaration",
  country: "jsonData.country",
  regions: "jsonData.regions",
  size: "jsonData.size",
  publicEmailAddress: "jsonData.publicEmailAddress",
  localServicesProvided: "jsonData.localServicesProvided",
  repatriation: "jsonData.repatriation",
  repatriationServicesProvided: "jsonData.repatriationServicesProvided",
  religiousCulturalServicesProvided: "jsonData.religiousCulturalServicesProvided",
  languagesSpoken: "jsonData.languagesSpoken",
};

// TODO: use the SerialisedWebhookData as the return type
export async function generateFormRunnerWebhookData(
  listItem: FuneralDirectorListItemGetObject,
  isUnderTest: boolean = false
): Promise<Array<Partial<Question>>> {
  const questions = await parseJsonFormData(ServiceType.funeralDirectors, isUnderTest);
  questions.forEach((question) => {
    question.fields?.forEach((field: Field) => {
      field.answer = get(listItem, FormRunnerFields[field.key]);
    });
  });
  return questions;
}
