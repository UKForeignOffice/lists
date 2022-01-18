import { Request } from "express";
import { CountryName, ServiceType } from "server/models/types";

export enum QuestionName {
  "readNotice" = "readNotice",
  "country" = "country",
  "region" = "region",
  "practiceArea" = "practiceArea",
  "readDisclaimer" = "readDisclaimer",
  "resultsTurnaround" = "resultsTurnaround",
  "readCovidDisclaimer" = "readCovidDisclaimer",
}

export interface QuestionError {
  field: string;
  text: string;
  href: string;
}

export interface Question {
  pageTitle: (req: Request) => string;
  needsToAnswer: (req: Request) => boolean;
  getViewPartialName: (req: Request) => string;
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
