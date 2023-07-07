import type { CountryName } from "server/models/types";
import type { ServiceType } from "shared/types";

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
