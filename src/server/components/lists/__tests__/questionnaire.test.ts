import { questions } from "../questionnaire";
import * as helpers from "../helpers";

describe("Questionnaire", () => {
  let req: any;

  beforeEach(() => {
    req = {
      params: {
        country: "Ghana",
        serviceType: "covidTestProviders",
      },
    };

    jest.spyOn(helpers, "getServiceLabel").mockReturnValue("XXX");
  });

  describe("readNotice", () => {
    const readNotice = questions.readNotice;

    test("getViewPartialName is correct", () => {
      const partialName = readNotice.getViewPartialName(req);
      expect(partialName).toBe(
        "covid-test-providers/covid-test-providers-notice.njk"
      );
    });

    test("pageTitle is correct when country is defined", () => {
      const pageTitle = readNotice.pageTitle(req);
      expect(pageTitle).toBe("Find XXX in Ghana");
    });

    test("pageTitle is correct when country is not defined", () => {
      delete req.params.country;
      const pageTitle = readNotice.pageTitle(req);
      expect(pageTitle).toBe("Find XXX Abroad");
    });

    test("needs to answer returns true when readNotice is undefined", () => {
      const needsToAnswer = readNotice.needsToAnswer(req);
      expect(needsToAnswer).toBe(true);
    });

    test("needs to answer returns false when readNotice is true", () => {
      req.params.readNotice = true;
      const needsToAnswer = readNotice.needsToAnswer(req);
      expect(needsToAnswer).toBe(false);
    });

    test("validates returns false", () => {
      const validates = readNotice.validate(req);
      expect(validates).toBe(false);
    });
  });

  describe("country", () => {
    const country = questions.country;

    test("getViewPartialName is correct", () => {
      const partialName = country.getViewPartialName(req);
      expect(partialName).toBe("questions/question-country.njk");
    });

    test("pageTitle is correct", () => {
      const pageTitle = country.pageTitle(req);
      expect(pageTitle).toBe("In which country do you need a xxx?");
    });

    test("needs to answer returns false when country is defined", () => {
      const result = country.needsToAnswer(req);
      expect(result).toBe(false);
    });

    test("needs to answer returns true when country is undefined", () => {
      delete req.params.country;
      const result = country.needsToAnswer(req);
      expect(result).toBe(true);
    });

    test("validates returns false when country is set", () => {
      const result = country.validate(req);
      expect(result).toBe(false);
    });

    test("validates returns error when country is falsy", () => {
      req.params.country = "";
      const result = country.validate(req);
      expect(result).toEqual({
        field: "country",
        text: "You must give a country name",
        href: "#country-autocomplete",
      });
    });
  });

  describe("region", () => {
    const region = questions.region;

    test("getViewPartialName is correct", () => {
      const partialName = region.getViewPartialName(req);
      expect(partialName).toBe("questions/question-region.njk");
    });

    test("pageTitle is correct for COVID test providers", () => {
      const pageTitle = region.pageTitle(req);

      expect(pageTitle).toBe(
        "Where in Ghana do you want to find a COVID-19 test provider?"
      );
    });

    test("pageTitle is correct for lawyers", () => {
      req.params.serviceType = "lawyers";

      const pageTitle = region.pageTitle(req);

      expect(pageTitle).toBe("Where in Ghana do you want to find a lawyer?");
    });

    test("needs to answer returns false when region is undefined", () => {
      req.params.region = "Bono";
      const result = region.needsToAnswer(req);
      expect(result).toBe(false);
    });

    test("needs to answer returns true when region is undefined", () => {
      const result = region.needsToAnswer(req);
      expect(result).toBe(true);
    });

    test("validates returns false when region is set", () => {
      req.params.region = "Bono";
      const result = region.validate(req);
      expect(result).toBe(false);
    });

    test("validates returns error when country is falsy", () => {
      req.params.region = "";
      const result = region.validate(req);
      expect(result).toEqual({
        field: "region",
        text: "You must give a city or area",
        href: "#area",
      });
    });
  });

  describe("practiceArea", () => {
    const practiceArea = questions.practiceArea;

    test("getViewPartialName is correct", () => {
      const partialName = practiceArea.getViewPartialName(req);
      expect(partialName).toBe("questions/question-practice-area.njk");
    });

    test("pageTitle is correct", () => {
      const pageTitle = practiceArea.pageTitle(req);
      expect(pageTitle).toBe("In what areas of law do you need legal help?");
    });

    test("needs to answer returns true when practiceArea is undefined", () => {
      const result = practiceArea.needsToAnswer(req);
      expect(result).toBe(true);
    });

    test("needs to answer returns false when practiceArea is defined", () => {
      req.params.practiceArea = "Intellectual property";
      const result = practiceArea.needsToAnswer(req);
      expect(result).toBe(false);
    });

    test("validates returns false when practiceArea is set", () => {
      req.params.practiceArea = "Intellectual property";
      const result = practiceArea.validate(req);
      expect(result).toBe(false);
    });

    test("validates returns error when practiceArea is falsy", () => {
      req.params.practiceArea = "";
      const result = practiceArea.validate(req);
      expect(result).toEqual({
        field: "practice-area",
        text: "Areas of law is not allowed to be empty",
        href: "#practice-area-bankruptcy",
      });
    });
  });

  describe("readDisclaimer", () => {
    const readDisclaimer = questions.readDisclaimer;

    test("getViewPartialName is correct", () => {
      const partialName = readDisclaimer.getViewPartialName(req);
      expect(partialName).toBe("questions/question-disclaimer.njk");
    });

    test("pageTitle is correct", () => {
      const pageTitle = readDisclaimer.pageTitle(req);
      expect(pageTitle).toBe("Disclaimer");
    });

    test("needs to answer returns true when practiceArea is undefined", () => {
      const result = readDisclaimer.needsToAnswer(req);
      expect(result).toBe(true);
    });

    test("needs to answer returns false when practiceArea is defined", () => {
      req.params.readDisclaimer = true;
      const result = readDisclaimer.needsToAnswer(req);
      expect(result).toBe(false);
    });

    test("validates returns false when readDisclaimer is set", () => {
      req.params.readDisclaimer = true;
      const result = readDisclaimer.validate(req);
      expect(result).toBe(false);
    });

    test("validates returns error when readDisclaimer is falsy", () => {
      req.params.readDisclaimer = "";
      const result = readDisclaimer.validate(req);
      expect(result).toEqual({
        field: "read-disclaimer",
        text: "You must accept the disclaimer to use this service",
        href: "#read-disclaimer",
      });
    });
  });

  describe("readCovidDisclaimer", () => {
    const readCovidDisclaimer = questions.readCovidDisclaimer;

    test("getViewPartialName is correct", () => {
      const partialName = readCovidDisclaimer.getViewPartialName(req);
      expect(partialName).toBe("questions/question-covid-disclaimer.njk");
    });

    test("pageTitle is correct", () => {
      const pageTitle = readCovidDisclaimer.pageTitle(req);
      expect(pageTitle).toBe("Disclaimer");
    });

    test("needs to answer returns true when readCovidDisclaimer is undefined", () => {
      const result = readCovidDisclaimer.needsToAnswer(req);
      expect(result).toBe(true);
    });

    test("needs to answer returns false when readCovidDisclaimer is defined", () => {
      req.params.readDisclaimer = true;
      const result = readCovidDisclaimer.needsToAnswer(req);
      expect(result).toBe(false);
    });

    test("validates returns false when readCovidDisclaimer is set", () => {
      req.params.readDisclaimer = true;
      const result = readCovidDisclaimer.validate(req);
      expect(result).toBe(false);
    });

    test("validates returns error when readCovidDisclaimer is falsy", () => {
      req.params.readDisclaimer = "";
      const result = readCovidDisclaimer.validate(req);
      expect(result).toEqual({
        field: "read-disclaimer",
        text: "You must accept the disclaimer to use this service",
        href: "#read-disclaimer",
      });
    });
  });

  describe("resultsTurnaround", () => {
    const resultsTurnaround = questions.resultsTurnaround;

    test("getViewPartialName is correct", () => {
      const partialName = resultsTurnaround.getViewPartialName(req);
      expect(partialName).toBe("questions/question-results-turnaround.njk");
    });

    test("pageTitle is correct", () => {
      const pageTitle = resultsTurnaround.pageTitle(req);
      expect(pageTitle).toBe(
        "How long after taking the Covid test do you need the provider to turnaround the results?"
      );
    });

    test("needs to answer returns true when resultsTurnaround is undefined", () => {
      const result = resultsTurnaround.needsToAnswer(req);
      expect(result).toBe(true);
    });

    test("needs to answer returns false when resultsTurnaround is defined", () => {
      req.params.resultsTurnaround = "48";
      const result = resultsTurnaround.needsToAnswer(req);
      expect(result).toBe(false);
    });

    test("validates returns false when resultsTurnaround is set", () => {
      req.params.resultsTurnaround = "Intellectual property";
      const result = resultsTurnaround.validate(req);
      expect(result).toBe(false);
    });

    test("validates returns error when resultsTurnaround is falsy", () => {
      req.params.resultsTurnaround = "undefined";
      const result = resultsTurnaround.validate(req);
      expect(result).toEqual({
        field: "results-turnaround",
        text: "You must select an option",
        href: "#results-turnaround-1",
      });
    });
  });
});
