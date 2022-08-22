import { Request } from "express";
import { startCase, kebabCase } from "lodash";
import { ServiceType } from "server/models/types";
import {
  parseListValues,
  getServiceLabel,
  getAllRequestParams,
} from "./helpers";
import { QuestionName, Question, QuestionData } from "./types";
import {
  interpretationServices,
  languages, legalPracticeAreasList,
  translationInterpretationServices,
  translationSpecialties
} from "server/services/metadata";

type Questions = {
  [key in QuestionName]: Question;
};

export const questions: Questions = {
  readNotice: {
    getViewPartialName(req) {
      const { serviceType } = getAllRequestParams(req);
      return `${kebabCase(serviceType)}/${kebabCase(serviceType)}-notice.njk`;
    },
    pageTitle(req) {
      const { country, serviceType } = getAllRequestParams(req);
      return country === undefined || country === ""
        ? `Find ${getServiceLabel(serviceType)} Abroad`
        : `Find ${getServiceLabel(serviceType)} in ${startCase(country)}`;
    },
    needsToAnswer(req) {
      const { readNotice } = getAllRequestParams(req);
      return readNotice === undefined;
    },
    validate() {
      return false;
    },
  },
  country: {
    getViewPartialName() {
      return "questions/question-country.njk";
    },
    pageTitle(req: Request) {
      const { serviceType } = getAllRequestParams(req);
      const serviceLabel = getServiceLabel(serviceType)?.toLowerCase();
      return `In which country do you need a ${serviceLabel}?`;
    },
    needsToAnswer(req: Request) {
      const { country } = getAllRequestParams(req);
      return country === undefined || country === "";
    },
    validate(req: Request) {
      const { country } = getAllRequestParams(req);

      if (country === "") {
        return {
          field: "country",
          text: "You must give a country name",
          href: "#country-autocomplete",
        };
      }

      return false;
    },
  },
  region: {
    getViewPartialName() {
      return "questions/question-region.njk";
    },
    pageTitle(req) {
      const { country, serviceType } = getAllRequestParams(req);
      const formattedCountry = startCase(country);
      const titles = {
        [ServiceType.covidTestProviders]: `Where in ${formattedCountry} do you want to find a COVID-19 test provider?`,
        [ServiceType.lawyers]: `Where in ${formattedCountry} do you want to find a lawyer?`,
        [ServiceType.funeralDirectors]: `Where in ${formattedCountry} do you want to find a funeral director?`,
        [ServiceType.translatorsInterpreters]: `Where in ${formattedCountry} do you want to find a translator or interpreter?`,
      };

      return serviceType !== undefined ? titles[serviceType] : "";
    },
    needsToAnswer(req: Request) {
      const { region } = getAllRequestParams(req);
      return region === undefined || region === "";
    },
    validate(req: Request) {
      const { region } = getAllRequestParams(req);

      if (region === "") {
        return {
          field: "region",
          text: "You must give a city or area",
          href: "#area",
        };
      }

      return false;
    },
  },
  practiceArea: {
    getViewPartialName() {
      return "questions/question-practice-area.njk";
    },
    pageTitle() {
      return "In what areas of law do you need legal help?";
    },
    needsToAnswer(req: Request) {
      const params = getAllRequestParams(req);
      const practiceArea = parseListValues("practiceArea", params);
      const error = practiceArea === undefined;
      return error || practiceArea?.length === 0 || practiceArea === undefined;
    },
    getPartialData(req) {
      return legalPracticeAreasList.map((areaOfLaw) => {
        return {
          text: areaOfLaw,
          value: areaOfLaw,
        }
      });
    },
    validate(req: Request) {
      const params = getAllRequestParams(req);
      const practiceArea = parseListValues("practiceArea", params);

      if (practiceArea?.join("") === "") {
        return {
          field: "practice-area",
          text: "You must select at least one area of law",
          href: "#practice-area-bankruptcy",
        };
      }
      return false;
    },
  },
  readDisclaimer: {
    getViewPartialName() {
      return "questions/question-disclaimer.njk";
    },
    pageTitle() {
      return "Disclaimer";
    },
    needsToAnswer(req: Request) {
      const { readDisclaimer } = getAllRequestParams(req);
      return readDisclaimer === undefined || readDisclaimer === "";
    },
    validate(req: Request) {
      const { readDisclaimer } = getAllRequestParams(req);

      if (readDisclaimer === "") {
        return {
          field: "read-disclaimer",
          text: "You must accept the disclaimer to use this service",
          href: "#read-disclaimer",
        };
      }

      return false;
    },
  },
  readCovidDisclaimer: {
    getViewPartialName() {
      return "questions/question-covid-disclaimer.njk";
    },
    pageTitle() {
      return "Disclaimer";
    },
    needsToAnswer(req: Request) {
      const { readDisclaimer } = getAllRequestParams(req);
      return readDisclaimer === undefined || readDisclaimer === "";
    },
    validate(req: Request) {
      const { readDisclaimer } = getAllRequestParams(req);

      if (readDisclaimer === "") {
        return {
          field: "read-disclaimer",
          text: "You must accept the disclaimer to use this service",
          href: "#read-disclaimer",
        };
      }

      return false;
    },
  },
  resultsTurnaround: {
    getViewPartialName() {
      return "questions/question-results-turnaround.njk";
    },
    pageTitle() {
      return "How long after taking the Covid test do you need the provider to turnaround the results?";
    },
    needsToAnswer(req: Request) {
      const { resultsTurnaround } = getAllRequestParams(req);
      return (
        resultsTurnaround === undefined || resultsTurnaround === "undefined"
      );
    },
    validate(req: Request) {
      const { resultsTurnaround } = getAllRequestParams(req);

      if (resultsTurnaround === "undefined") {
        return {
          field: "results-turnaround",
          text: "You must select an option",
          href: "#results-turnaround-1",
        };
      }

      return false;
    },
  },
  insurance: {
    getViewPartialName() {
      return "questions/question-insurance.njk";
    },
    pageTitle() {
      return "Did the deceased have insurance?";
    },
    needsToAnswer(req: Request) {
      const { insurance } = getAllRequestParams(req);
      return insurance === undefined || insurance === "";
    },
    validate(req: Request) {
      const { insurance } = getAllRequestParams(req);

      if (insurance === "") {
        return {
          field: "insurance",
          text: " Error: You must select whether the deceased had insurance or not",
          href: "#insurance-yes",
        };
      }
      return false;
    },
  },
  contactInsurance: {
    getViewPartialName() {
      return "questions/question-contact-insurance.njk";
    },
    pageTitle() {
      return "Did the deceased have insurance?";
    },
    needsToAnswer(req: Request) {
      const { insurance, contactInsurance } = getAllRequestParams(req);
      return (
        insurance === "yes" &&
        (contactInsurance === undefined || contactInsurance === "")
      );
    },
    validate(req: Request) {
      const { insurance } = getAllRequestParams(req);

      if (insurance === "") {
        return {
          field: "insurance",
          text: " Error: Did the deceased have insurance? is required",
          href: "#insurance-yes",
        };
      }
      return false;
    },
  },
  repatriation: {
    getViewPartialName() {
      return "questions/question-repatriation.njk";
    },
    pageTitle() {
      return "Do you want to repatriate the deceased back to the UK?";
    },
    needsToAnswer(req: Request) {
      const { repatriation } = getAllRequestParams(req);
      return repatriation === undefined || repatriation === "";
    },
    validate(req: Request) {
      const { repatriation } = getAllRequestParams(req);

      if (repatriation === "") {
        return {
          field: "repatriation",
          text: "You must select whether you want the deceased to be repatriated or not",
          href: "#repatriation-yes",
        };
      }
      return false;
    },
  },
  servicesProvided: {
    getViewPartialName() {
      return "questions/question-services-provided.njk";
    },
    pageTitle() {
      return "What services do you need?";
    },
    needsToAnswer(req: Request) {
      const { servicesProvided } = getAllRequestParams(req);
      return servicesProvided === undefined || servicesProvided === "";
    },
    getPartialData(req) {
      return translationInterpretationServices;
    },
    validate(req: Request) {
      const { repatriation } = getAllRequestParams(req);

      if (repatriation === "") {
        return {
          field: "services-provider",
          text: "You must select the type of services that you need",
          href: "#services-provided-yes",
        };
      }
      return false;
    },
  },
  languagesProvided: {
    getViewPartialName() {
      return "questions/question-languages-provided.njk";
    },
    pageTitle(req: Request) {
      const { servicesProvided } = getAllRequestParams(req);
      let title = "Which language(s) do you need translating or interpreting?";
      if (isTranslatingServiceOnlyPopulated(servicesProvided as string[])) {
        title = "Which language(s) do you need translating?";

      } else if (isInterpretingServiceOnlyPopulated(servicesProvided as string[])) {
        title = "Which language(s) do you need interpreting?";
      }
      return title;
    },
    pageHintText(req: Request) {
      const { servicesProvided } = getAllRequestParams(req);
      const hintTextStart = "Start typing and select a language. All providers can";
      let hintText = `${hintTextStart} translate or interpret into English.`;
      if (isTranslatingServiceOnlyPopulated(servicesProvided as string[])) {
        hintText = `${hintTextStart} translate into English.`;

      } else if (isInterpretingServiceOnlyPopulated(servicesProvided as string[])) {
        hintText = `${hintTextStart} interpret into English.`;
      }
      return hintText;
    },
    needsToAnswer(req: Request) {
      const { languagesProvided, languagesPopulated } = getAllRequestParams(req);
      return  !languagesPopulated || languagesProvided === undefined || languagesProvided === "";
    },
    getPartialData(req) {
      const partialData: QuestionData[] = [];
      Object.entries(languages).forEach(([key, value]) => {
        partialData.push({
          text: value,
          value: key,
        })
      });
      return partialData;
    },
    validate(req: Request) {
      const { languagesProvided, languagesPopulated } = getAllRequestParams(req);

      if (languagesProvided === "" && languagesPopulated) {
        return {
          field: "languagesProvided",
          text: "You must select the language(s) you need translating or interpreting",
          href: "#languages-provided-yes",
        };
      }
      return false;
    },
  },
  languagesSummary: {
    getViewPartialName() {
      return "questions/question-languages-summary.njk";
    },
    pageTitle() {
      return "You have selected these languages";
    },
    needsToAnswer(req: Request) {
      const { languagesProvided, languagesConfirmed } = getAllRequestParams(req);
      return  !languagesConfirmed || languagesProvided === undefined || languagesProvided === "";
    },
    getPartialData(req) {
      const partialData: QuestionData[] = [];
      Object.entries(languages).forEach(([key, value]) => {
        partialData.push({
          text: value,
          value: key,
        })
      });
      return partialData;
    },
    validate(req: Request) {
      const { languagesProvided, languagesConfirmed } = getAllRequestParams(req);

      if (languagesProvided === "" && languagesConfirmed) {
        return {
          field: "languagesProvided",
          text: "You must select the language(s) you need translating or interpreting",
          href: "#languages-provided-yes",
        };
      }
      return false;
    },
  },
  translationSpecialties: {
    getViewPartialName() {
      return "questions/question-translation-specialties.njk";
    },
    pageTitle() {
      return "What type of translation do you need?";
    },
    needsToAnswer(req: Request) {
      const { servicesProvided, translationSpecialties, interpreterServices } = getAllRequestParams(req);
      const result: boolean = (!translationSpecialties
        && (servicesProvided?.includes("translation")
          && (!servicesProvided?.includes("interpretation")
            || ((servicesProvided?.includes("interpretation") && !!interpreterServices))
          )
        )
      ) as boolean;
      return result;
    },
    getPartialData(req) {
      return translationSpecialties;
    },
    validate(req: Request) {
      const { translationSpecialties } = getAllRequestParams(req);

      if (translationSpecialties === "") {
        return {
          field: "translationSpecialties",
          text: "You must select the type of translation you need",
          href: "#translation-specialties-yes",
        };
      }
      return false;
    },
  },
  interpreterServices: {
    getViewPartialName() {
      return "questions/question-interpreter-services.njk";
    },
    pageTitle() {
      return "What type of interpretation do you need?";
    },
    needsToAnswer(req: Request) {
      const { servicesProvided, interpreterServices, translationSpecialties } = getAllRequestParams(req);
      const result: boolean = (!interpreterServices
        && (servicesProvided?.includes("interpretation")
          && (!servicesProvided?.includes("translation")
            || ((servicesProvided?.includes("translation") && !!translationSpecialties))
          )
        )
      ) as boolean;
      return result;
    },
    getPartialData(req) {
      return interpretationServices;
    },
    validate(req: Request) {
      const { interpreterServices } = getAllRequestParams(req);

      if (interpreterServices === "") {
        return {
          field: "interpreterServices",
          text: "You must select the type of interpretation you need",
          href: "#interpreter-services-yes",
        };
      }
      return false;
    },
  },
  interpreterTranslationServices: {
    getViewPartialName() {
      return "questions/question-interpreter-translation-services.njk";
    },
    pageTitle() {
      return "What types of translating and interpreting do you need?";
    },
    needsToAnswer(req: Request) {
      const { servicesProvided, interpreterServices, translationSpecialties } = getAllRequestParams(req);
      return (!servicesProvided
          || servicesProvided.includes("All")
          || (servicesProvided.includes("translation") && servicesProvided?.includes("interpretation"))
        )
        && (!interpreterServices)
        && (!translationSpecialties);
    },
    getPartialData(req) {
      return [
        {
          name: "translationSpecialties",
          data: translationSpecialties,
        },
        {
          name: "interpretationServices",
          data: interpretationServices,
        }
      ];
    },
    validate(req: Request) {
      const { interpreterTranslationServices, interpreterServices, translationSpecialties } = getAllRequestParams(req);

      if (interpreterTranslationServices === "" && interpreterServices === "" && translationSpecialties === "") {
        return {
          field: "interpreterTranslationServices",
          text: "You must select the type of translation and interpreting you need",
          href: "#interpreter-translation-services-yes",
        };
      }
      return false;
    },
  },
};

function isTranslatingServiceOnlyPopulated(servicesProvided: string[]): boolean {
  return servicesProvided?.includes("translation") && !servicesProvided?.includes("interpretation") && !servicesProvided?.includes("All");
}

function isInterpretingServiceOnlyPopulated(servicesProvided: string[]): boolean {
  return servicesProvided?.includes("interpretation") && !servicesProvided?.includes("translation") && !servicesProvided?.includes("All");
}
