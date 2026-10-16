import type { Request, Response } from "express";
import { interpretationServices, languages, translationSpecialties } from "server/services/metadata";
import { sanitiseInterpretationTypes } from "server/components/lists/find/helpers/sanitiseInterpretationTypes";
import { sanitiseTranslationTypes } from "server/components/lists/find/helpers/sanitiseTranslationTypes";
import { loadQueryParametersIntoSession } from "../loadQueryParametersIntoSession";
import { checkIncompleteState } from "../checkIncompleteState";

const [languageCode, languageName] = Object.entries(languages)[0];

function runMiddleware(answers: Record<string, unknown>, serviceType = "translators-interpreters") {
  const req = {
    params: { serviceType, country: "FR" },
    session: { answers },
  } as unknown as Request;
  const res = { redirect: jest.fn() } as unknown as Response;
  const next = jest.fn();

  checkIncompleteState(req, res, next);

  return { req, res, next };
}

function runQueryParametersThroughMiddleware(query: Record<string, string>) {
  const req = {
    params: { serviceType: "translators-interpreters", country: "FR" },
    query,
    session: { answers: {} },
  } as unknown as Request;
  const res = { redirect: jest.fn() } as unknown as Response;
  const loadNext = jest.fn();
  const next = jest.fn();

  loadQueryParametersIntoSession(req, res, loadNext);
  checkIncompleteState(req, res, next);

  return { req, res, next, loadNext };
}

describe("checkIncompleteState for translators and interpreters", () => {
  const commonAnswers = {
    languages: languageCode,
    languagesReadable: languageName,
  };

  test.each([
    ["missing", undefined],
    ["empty", []],
    ["invalid", "not-a-translation-type"],
  ])("redirects translation-only answers when translation types are %s", (_description, translationTypes) => {
    const { res, next } = runMiddleware({
      ...commonAnswers,
      services: "translation",
      ...(translationTypes !== undefined && { translationTypes }),
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith("/find/translators-interpreters?country=FR");
  });

  test.each([
    ["missing", undefined],
    ["empty", []],
    ["invalid", "not-an-interpretation-type"],
  ])("redirects interpretation-only answers when interpretation types are %s", (_description, interpretationTypes) => {
    const { res, next } = runMiddleware({
      ...commonAnswers,
      services: "interpretation",
      ...(interpretationTypes !== undefined && { interpretationTypes }),
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith("/find/translators-interpreters?country=FR");
  });

  test.each(["translation", "interpretation"])(
    "redirects answers requiring both services when %s types are missing",
    (missingTypes) => {
      const { res, next } = runMiddleware({
        ...commonAnswers,
        services: ["translation", "interpretation"],
        ...(missingTypes === "translation"
          ? { interpretationTypes: interpretationServices[0].value }
          : { translationTypes: translationSpecialties[0].value }),
      });

      expect(next).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/find/translators-interpreters?country=FR");
    }
  );

  test("allows translation-only answers when translation types are present", () => {
    const { res, next } = runMiddleware({
      ...commonAnswers,
      services: "translation",
      translationTypes: translationSpecialties[0].value,
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("allows interpretation-only answers when interpretation types are present", () => {
    const { res, next } = runMiddleware({
      ...commonAnswers,
      services: "interpretation",
      interpretationTypes: interpretationServices[0].value,
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("allows answers with both services when both types are present", () => {
    const { res, next } = runMiddleware({
      ...commonAnswers,
      services: ["translation", "interpretation"],
      translationTypes: translationSpecialties[0].value,
      interpretationTypes: interpretationServices[0].value,
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("allows valid array-form type answers when both services are selected", () => {
    const { res, next } = runMiddleware({
      ...commonAnswers,
      services: ["translation", "interpretation"],
      translationTypes: [translationSpecialties[0].value, translationSpecialties[1].value],
      interpretationTypes: [interpretationServices[0].value, interpretationServices[1].value],
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("allows empty type arrays for unselected services", () => {
    const { res, next } = runMiddleware({
      ...commonAnswers,
      services: "translation",
      translationTypes: translationSpecialties[0].value,
      interpretationTypes: [],
    });

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("keeps standalone type sanitizers usable", () => {
    expect(sanitiseTranslationTypes("not-a-translation-type")).toEqual([]);
    expect(sanitiseInterpretationTypes("not-an-interpretation-type")).toEqual([]);
  });

  test("type sanitizers retain valid scalar and array values while stripping invalid array entries", () => {
    const translationType = translationSpecialties[0].value;
    const interpretationType = interpretationServices[0].value;

    expect(sanitiseTranslationTypes(translationType)).toEqual([translationType]);
    expect(sanitiseTranslationTypes([translationType, "not-a-translation-type"])).toEqual([translationType]);
    expect(sanitiseInterpretationTypes(interpretationType)).toEqual([interpretationType]);
    expect(sanitiseInterpretationTypes([interpretationType, "not-an-interpretation-type"])).toEqual([
      interpretationType,
    ]);
  });

  test.each([
    [
      "invalid",
      { translationSpecialties: "not-a-translation-type", interpreterServices: interpretationServices[0].value },
    ],
    ["missing", { translationSpecialties: translationSpecialties[0].value }],
  ])("redirects query-loaded answers when one selected service has %s types", (_description, typeParameters) => {
    const { req, res, next, loadNext } = runQueryParametersThroughMiddleware({
      serviceType: "translatorsInterpreters",
      country: "FR",
      languagesProvided: languageCode,
      servicesProvided: "translation,interpretation",
      ...typeParameters,
    });

    expect(loadNext).toHaveBeenCalledTimes(1);
    expect(req.session.answers?.services).toEqual(["translation", "interpretation"]);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith("/find/translators-interpreters?country=FR");
  });

  test("continues query-loaded answers when both selected services have valid types", () => {
    const { req, res, next, loadNext } = runQueryParametersThroughMiddleware({
      serviceType: "translatorsInterpreters",
      country: "FR",
      languagesProvided: languageCode,
      servicesProvided: "translation,interpretation",
      translationSpecialties: translationSpecialties[0].value,
      interpreterServices: interpretationServices[0].value,
    });

    expect(loadNext).toHaveBeenCalledTimes(1);
    expect(req.session.answers?.services).toEqual(["translation", "interpretation"]);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.redirect).not.toHaveBeenCalled();
  });
});

describe("checkIncompleteState for other service types", () => {
  test("continues valid lawyer answers", () => {
    const { res, next } = runMiddleware({ practiceAreas: "Corporate" }, "lawyers");

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("continues funeral director answers without translator context", () => {
    const { res, next } = runMiddleware({}, "funeral-directors");

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
