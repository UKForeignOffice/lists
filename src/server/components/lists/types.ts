import { Request } from "express";
import { CountryName } from "server/models/types";
import { ServiceType } from "shared/types";

export enum QuestionName {
  "readNotice" = "readNotice",
  "country" = "country",
  "region" = "region",
  "practiceArea" = "practiceArea",
  "readDisclaimer" = "readDisclaimer",
  "resultsTurnaround" = "resultsTurnaround",
  "readCovidDisclaimer" = "readCovidDisclaimer",
  "insurance" = "insurance",
  "contactInsurance" = "contactInsurance",
  "repatriation" = "repatriation",
  "servicesProvided" = "servicesProvided",
  "languagesProvided" = "languagesProvided",
  "languagesSummary" = "languagesSummary",
  "translationSpecialties" = "translationSpecialties",
  "interpreterServices" = "interpreterServices",
  "interpreterTranslationServices" = "interpreterTranslationServices",
}

export interface QuestionError {
  field: string;
  text: string;
  href: string;
}

export interface QuestionData {
  text: string;
  value: string;
  description?: string;
}

export interface QuestionDataSet {
  name: string;
  data: QuestionData[];
}

export interface Question {
  pageTitle: (req: Request) => string;
  pageHintText?: (req: Request) => string;
  needsToAnswer: (req: Request) => boolean;
  getViewPartialName: (req: Request) => string;
  getPartialData?: (req: Request) => QuestionDataSet[] | QuestionData[];
  validate: (req: Request) => boolean | QuestionError;
}

export interface ListsRequestParams {
  serviceType?: ServiceType;
  country?: CountryName | "";
  region?: string;
  practiceArea?: string | string[];
  legalAid?: "yes" | "no" | "";
  proBono?: "yes" | "no" | "";
  readNotice?: string;
  readDisclaimer?: string;
  resultsTurnaround?: string;
  page?: string;
  print?: "yes" | "no" | "";
  insurance?: "yes" | "no" | "";
  contactInsurance?: "done" | "";
  sameCountry?: "yes" | "no" | "";
  repatriation?: "yes" | "no" | "";
  servicesProvided?: string | string[];
  languagesProvided?: string | string[]; // need to include languages summary after this
  newLanguage?: string; // need to include languages summary after this
  translationSpecialties?: string | string[];
  interpreterServices?: string | string[];
  interpreterTranslationServices?: string | string[];
  languagesPopulated?: boolean;
  languagesConfirmed?: boolean;
  continueButton?: string;
}

export interface PaginationResults {
  pagination: {
    results: {
      from: number;
      to: number;
      count: number;
      currentPage: number;
    };
    previous: {
      text: string;
      href: string;
    };
    next: {
      text: string;
      href: string;
    };
    items: PaginationItem[];
  };
}

export interface PaginationItem {
  text: string;
  href: string;
}
