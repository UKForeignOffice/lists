import { LawyerListItemGetObject } from "server/models/types";
import { ServiceType } from "shared/types";
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
const FormRunnerFields: Record<string, string> = {
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
  areasOfLaw: "jsonData.areasOfLaw",
  legalAid: "jsonData.legalAid",
  proBono: "jsonData.proBono",
  representedBritishNationals: "jsonData.representedBritishNationals",
  phoneNumber: "jsonData.phoneNumber",
  contactPhoneNumber: "jsonData.contactPhoneNumber",
  regulators: "jsonData.regulators",
  declaration: "jsonData.declaration",
  country: "jsonData.country",
  regions: "jsonData.regions",
  size: "jsonData.size",
  publicEmailAddress: "jsonData.publicEmailAddress",
};

// TODO: use the SerialisedWebhookData as the return type
export async function generateFormRunnerWebhookData(
  listItem: LawyerListItemGetObject
): Promise<Array<Partial<Question>>> {
  const questions = await parseJsonFormData(ServiceType.lawyers);
  questions.forEach((question) => {
    question.fields?.forEach((field: Field) => {
      field.answer = get(listItem, FormRunnerFields[field.key]);
    });
  });
  return questions;
}
