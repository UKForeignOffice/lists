import type { Request, Response } from "express";
import { interpretationServices, languages, translationSpecialties } from "server/services/metadata";
import { checkIncompleteState } from "../checkIncompleteState";

const [languageCode, languageName] = Object.entries(languages)[0];

function runMiddleware(answers: Record<string, unknown>) {
  const req = {
    params: { serviceType: "translators-interpreters", country: "FR" },
    session: { answers },
  } as unknown as Request;
  const res = { redirect: jest.fn() } as unknown as Response;
  const next = jest.fn();

  checkIncompleteState(req, res, next);

  return { res, next };
}

describe("checkIncompleteState for translators and interpreters", () => {
  const commonAnswers = {
    languages: languageCode,
    languagesReadable: languageName,
  };

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
});
