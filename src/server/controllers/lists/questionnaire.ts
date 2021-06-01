import { Request } from "express";
import { startCase, kebabCase } from "lodash";
import {
  countryHasLegalAid,
  getAllRequestParams,
  getServiceLabel,
  parseListValues,
} from "./helpers";
import { QuestionName, Question } from "./types";

export const questions: {
  [key in QuestionName]: Question;
} = {
  readNotice: {
    pageTitle(req) {
      const { country, serviceType } = getAllRequestParams(req);
      return country === undefined || country === ""
        ? `Find ${getServiceLabel(serviceType)} Abroad`
        : `Find ${getServiceLabel(serviceType)} in ${startCase(country)}`;
    },
    getViewPartialName(req) {
      const { serviceType } = getAllRequestParams(req);
      return `${kebabCase(serviceType)}-notice.html`;
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
      return "question-country.html";
    },
    pageTitle(req: Request) {
      const { serviceType } = getAllRequestParams(req);
      const serviceLabel = getServiceLabel(serviceType)?.toLowerCase();
      return `Which country do you need a ${serviceLabel} in?`;
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
          text: "Country field is not allowed to be empty",
          href: "#country-autocomplete",
        };
      }

      return false;
    },
  },
  region: {
    getViewPartialName() {
      return "question-region.html";
    },
    pageTitle(req) {
      const { country } = getAllRequestParams(req);
      return `Which area in ${startCase(country)} do you need a lawyer from?`;
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
          text: "Area field is not allowed to be empty",
          href: "#area",
        };
      }

      return false;
    },
  },
  practiceArea: {
    getViewPartialName() {
      return "question-practice-area.html";
    },
    pageTitle() {
      return "In which field of law do you need legal help?";
    },
    needsToAnswer(req: Request) {
      const params = getAllRequestParams(req);
      const practiceArea = parseListValues("practiceArea", params);
      return practiceArea === undefined || practiceArea.length === 0;
    },
    validate(req: Request) {
      const params = getAllRequestParams(req);
      const practiceArea = parseListValues("practiceArea", params);

      if (practiceArea?.join("") === "") {
        return {
          field: "practice-area",
          text: "Practice area is not allowed to be empty",
          href: "#practice-area-bankruptcy",
        };
      }

      return false;
    },
  },
  legalAid: {
    getViewPartialName() {
      return "question-legal-aid.html";
    },
    pageTitle() {
      return "Are you interested in legal aid?";
    },
    needsToAnswer(req: Request) {
      const { legalAid, country } = getAllRequestParams(req);
      return (
        (countryHasLegalAid(country) && legalAid === undefined) ||
        legalAid === ""
      );
    },
    validate(req: Request) {
      const { legalAid } = getAllRequestParams(req);

      if (legalAid === "") {
        return {
          field: "legal-aid",
          text: "Legal aid is not allowed to be empty",
          href: "#legal-aid-yes",
        };
      }

      return false;
    },
  },
  proBono: {
    getViewPartialName() {
      return "question-pro-bono.html";
    },
    pageTitle() {
      return "Are you interested in pro bono services?";
    },
    needsToAnswer(req: Request) {
      const { proBono } = getAllRequestParams(req);
      return proBono === undefined || proBono === "";
    },
    validate(req: Request) {
      const { proBono } = getAllRequestParams(req);

      if (proBono === "") {
        return {
          field: "pro-bono",
          text: "Pro bono is not allowed to be empty",
          href: "#pro-bono-yes",
        };
      }

      return false;
    },
  },
  readDisclaimer: {
    getViewPartialName() {
      return "question-disclaimer.html";
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
          text: "Disclaimer is not allowed to be empty",
          href: "#read-disclaimer",
        };
      }

      return false;
    },
  },
  readCovidDisclaimer: {
    getViewPartialName() {
      return "question-covid-disclaimer.html";
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
          text: "Disclaimer is not allowed to be empty",
          href: "#read-disclaimer",
        };
      }

      return false;
    },
  },
  resultsTurnaround: {
    getViewPartialName() {
      return "question-results-turnaround.html";
    },
    pageTitle() {
      return "How long after taking the Covid test do you need the provider to turnaround the results?";
    },
    needsToAnswer(req: Request) {
      const params = getAllRequestParams(req);
      const resultsTurnaround = parseListValues("resultsTurnaround", params);
      return resultsTurnaround === undefined || resultsTurnaround.length === 0;
    },
    validate(req: Request) {
      const params = getAllRequestParams(req);
      const resultsTurnaround = parseListValues("resultsTurnaround", params);

      if (resultsTurnaround?.join("") === "") {
        return {
          field: "practice-area",
          text: "Practice area is not allowed to be empty",
          href: "#practice-area-bankruptcy",
        };
      }

      return false;
    },
  },
};
