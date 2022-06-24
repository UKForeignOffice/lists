import { Request } from "express";
import { startCase, kebabCase } from "lodash";
import { ServiceType } from "server/models/types";
import {
  parseListValues,
  getServiceLabel,
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
      const error = (practiceArea === undefined);
      return error || practiceArea?.length === 0 || practiceArea === undefined;
    },
    validate(req: Request) {
      const params = getAllRequestParams(req);
      const practiceArea = parseListValues("practiceArea", params);

      if (practiceArea?.join("") === "") {
        return {
          field: "practice-area",
          text: "Areas of law is not allowed to be empty",
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
  sameCountry: {
    getViewPartialName() {
      return "questions/question-same-country.njk";
    },
    pageTitle() {
      return "Do you want to use a funeral director in the country in which the person died?";
    },
    needsToAnswer(req: Request) {
      const { sameCountry } = getAllRequestParams(req);
      return sameCountry === undefined || sameCountry === "";
    },
    validate(req: Request) {
      const { sameCountry } = getAllRequestParams(req);

      if (sameCountry === "") {
        return {
          field: "same-country",
          text: "You must select if you want to use a funeral director in the country in which the person died",
          href: "#same-country-yes",
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
      return "Do you want to repatriation the deceased to the UK?";
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
          text: "You must select if you want to to repatriation the deceased to the UK",
          href: "#repatriation-yes",
        };
      }
      return false;
    },
  },
};
