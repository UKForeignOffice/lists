import {
  LawyerListItemGetObject,
  ServiceType
} from "server/models/types";
import { FormRunnerField, FormRunnerQuestion } from "server/components/formRunner/types";
import { parseJsonFormData } from "server/components/formRunner/helpers";
import { get } from "lodash";

const FormRunnerFields: {[key: string]: string} = {
  speakEnglish: "jsonData.speakEnglish",
  contactName: "jsonData.contactName",
  organisationName: "jsonData.organisationName",
  addressLine1: "address.firstLine",
  addressLine2: "address.secondLine",
  city: "address.city",
  postcode: "address.postCode",
  addressCountry: "address.country.name",
  websiteAddress: "jsonData.websiteAddress",
  emailAddress: "jsonData.emailAddress",
  publishEmail: "jsonData.publishEmail",
  areasOfLaw: "jsonData.areasOfLaw",
  legalAid: "jsonData.legalAid",
  proBono: "jsonData.proBono",
  representedBritishNationals: "jsonData.representedBritishNationals",
  phoneNumber: "jsonData.phoneNumber",
  emergencyPhoneNumber: "jsonData.emergencyPhoneNumber",
  regulators: "jsonData.regulators",
  declaration: "jsonData.declaration",
  country: "jsonData.country",
  regions: "jsonData.regions",
  size: "jsonData.size",
  publicEmailAddress: "jsonData.publicEmailAddress",
}


export async function generateFormRunnerWebhookData(listItem: LawyerListItemGetObject,
                                                    isUnderTest?: boolean): Promise<Array<Partial<FormRunnerQuestion>>> {
  const questions = await parseJsonFormData(ServiceType.lawyers, isUnderTest);

  questions.forEach((question) => {
    question.fields?.forEach((field: FormRunnerField) => {
      field.answer = get(listItem, FormRunnerFields[field.key]);
    });
  });
  return questions;
}
