import { Request } from "express";
import { CountryName, ServiceType } from "server/models/types";

export enum QuestionName {
  "readNotice" = "readNotice",
  "country" = "country",
  "region" = "region",
  "practiceArea" = "practiceArea",
  "proBono" = "proBono",
  "legalAid" = "legalAid",
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
}
