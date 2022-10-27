import {
  ServiceType,
  TranslatorInterpreterListItemGetObject
} from "server/models/types";
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
  "address.firstLine": "address.firstLine",
  "address.secondLine": "address.secondLine",
  city: "address.city",
  postCode: "address.postCode",
  addressCountry: "address.country.name",
  websiteAddress: "jsonData.websiteAddress",
  emailAddress: "jsonData.emailAddress",
  publishEmail: "jsonData.publishEmail",
  phoneNumber: "jsonData.phoneNumber",
  emergencyPhoneNumber: "jsonData.emergencyPhoneNumber",
  regulators: "jsonData.regulators",
  declaration: "jsonData.declaration",
  country: "jsonData.country",
  regions: "jsonData.regions",
  size: "jsonData.size",
  representedBritishNationals: "jsonData.representedBritishNationals",
  publicEmailAddress: "jsonData.publicEmailAddress",
  servicesProvided: "jsonData.servicesProvided",
  addressDisplay: "jsonData.addressDisplay",
  memberOfProfessionalAssociations: "jsonData.memberOfProfessionalAssociations",
  deliveryOfServices: "jsonData.deliveryOfServices",
  translationSpecialties: "jsonData.translationSpecialties",
  interpreterServices: "jsonData.interpreterServices",
  languagesProvided: "jsonData.languagesProvided",
};

// TODO: use the SerialisedWebhookData as the return type
export async function generateFormRunnerWebhookData(
  listItem: TranslatorInterpreterListItemGetObject,
  isUnderTest?: boolean
): Promise<Array<Partial<Question>> | undefined> {
  const questions = await parseJsonFormData(ServiceType.translatorsInterpreters, isUnderTest);
  questions?.forEach((question) => {
    question.fields?.forEach((field: Field) => {
      field.answer = get(listItem, FormRunnerFields[field.key]);
    });
  });
  return questions;
}
