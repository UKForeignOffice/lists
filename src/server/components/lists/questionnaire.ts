import { Request } from "express";
import { startCase, kebabCase } from "lodash";
import { ServiceType } from "server/models/types";
import {
  parseListValues,
  getServiceLabel,
  countryHasLegalAid,
  getAllRequestParams,
} from "./helpers";
import { QuestionName, Question } from "./types";

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
        [ServiceType.covidTestProviders]: `Where in ${formattedCountry} do you need to find a COVID-19 test provider?`,
        [ServiceType.lawyers]: `Which area in ${formattedCountry} do you need a lawyer from?`,
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
      return "In which field of law do you need legal help?";
    },
    needsToAnswer(req: Request) {
      const params = getAllRequestParams(req);
      const practiceArea = parseListValues("practiceArea", params);
      return practiceArea?.length === 0 || practiceArea === undefined;
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
      return "questions/question-legal-aid.njk";
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
      return "questions/question-pro-bono.njk";
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
};
