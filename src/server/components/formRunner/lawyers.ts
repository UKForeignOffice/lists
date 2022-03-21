import {
  Country,
  LawyerListItemGetObject,
  LawyerListItemJsonData,
  ServiceType
} from "server/models/types";
import type { Question } from "digital-form-builder-mono/runner/src/server/schemas/types";
import { FormRunnerFields } from "server/components/formRunner/types";
import { parseJsonFormData } from "server/components/formRunner/helpers";

export async function generateFormRunnerWebhookData(listItem: LawyerListItemGetObject,
                                                    listCountry?: Partial<Country>,
                                                    isUnderTest?: boolean): Promise<Array<Partial<Question>>> {
  const questions = await parseJsonFormData(ServiceType.lawyers, isUnderTest);

  questions.forEach((question) => {
    question.fields?.forEach((field) => {
      const jsonData: LawyerListItemJsonData = listItem.jsonData ?? {};

      switch (field.key) {
        case FormRunnerFields.country :
          field.answer = ((listCountry?.name) != null) ? listCountry.name : "";
          break;
        case FormRunnerFields.addressCountry :
          field.answer = listItem.address.country.name;
          break;
        case FormRunnerFields.addressLine1 :
          field.answer = listItem.address.firstLine;
          break;
        case FormRunnerFields.addressLine2 :
          field.answer = listItem.address.secondLine ?? "";
          break;
        case FormRunnerFields.city :
          field.answer = listItem.address.city;
          break;
        case FormRunnerFields.postcode :
          field.answer = listItem.address.postCode;
          break;
        case FormRunnerFields.phoneNumber :
          field.answer = jsonData.phoneNumber;
          break;
        case FormRunnerFields.emergencyPhoneNumber :
          field.answer = jsonData.emergencyPhoneNumber ?? "";
          break;
        case FormRunnerFields.emailAddress :
          field.answer = jsonData.emailAddress;
          break;
        case FormRunnerFields.publicEmailAddress :
          field.answer = jsonData.publicEmailAddress ?? "";
          break;
        case FormRunnerFields.websiteAddress :
          field.answer = jsonData.websiteAddress ?? "";
          break;
        case FormRunnerFields.contactName :
          field.answer = jsonData.contactName;
          break;
        case FormRunnerFields.organisationName :
          field.answer = jsonData.organisationName;
          break;
        case FormRunnerFields.size :
          field.answer = jsonData.size;
          break;
        case FormRunnerFields.regulators :
          field.answer = jsonData.regulators;
          break;
        case FormRunnerFields.regions :
          field.answer = jsonData.regions;
          break;
        case FormRunnerFields.areasOfLaw :
          field.answer = jsonData.areasOfLaw ?? [];
          break;
        case FormRunnerFields.declaration :
          field.answer = jsonData.declaration ?? [];
          break;
        case FormRunnerFields.proBono :
          field.answer = `${jsonData.proBono}` === "true";
          break;
        case FormRunnerFields.legalAid :
          field.answer = `${jsonData.legalAid}` === "true";
          break;
        case FormRunnerFields.speakEnglish :
          field.answer = `${jsonData.speakEnglish}` === "true";
          break;
        case FormRunnerFields.representedBritishNationals :
          field.answer = `${jsonData.representedBritishNationals}` === "true";
          break;
        case FormRunnerFields.publishEmail :
          field.answer = `${jsonData.publishEmail}` ?? "No";
          break;
      }
    });
  });
  return questions;
}
