import type { Request, Response } from "express";
import { translationSpecialties, interpretationServices } from "server/services/metadata";
import type { QuestionData } from "server/components/lists";
import { sanitiseTranslationTypes } from "server/components/lists/find/helpers/sanitiseTranslationTypes";
import { sanitiseInterpretationTypes } from "server/components/lists/find/helpers/sanitiseInterpretationTypes";
import querystring from "querystring";

export function get(req: Request, res: Response) {
  const services = req.session.answers?.services ?? [];

  if (!services.length) {
    res.redirect("services");
    return;
  }

  res.render("lists/find/translators-interpreters/types.njk", {
    ...(services.includes("translation") && {
      translationTypes: {
        items: TranslationTypesItemsVM(),
        values: req.session.answers?.translationTypes ?? [],
      },
    }),
    ...(services.includes("interpretation") && {
      interpretationTypes: {
        items: InterpretationTypesItemsVM(),
        values: req.session.answers?.interpretationTypes ?? [],
      },
    }),
  });
}

export function post(req: Request, res: Response) {
  const translationTypes = sanitiseTranslationTypes(req.body.translation);
  const interpretationTypes = sanitiseInterpretationTypes(req.body.interpretation);
  const services = req.session.answers?.services ?? [];

  let shouldRedirectToTypes = false;
  if (services.includes("translation") && translationTypes.length === 0) {
    shouldRedirectToTypes = true;
    req.flash("error-translation", "Select at least one type of translation");
  }

  if (services.includes("interpretation") && interpretationTypes.length === 0) {
    shouldRedirectToTypes = true;
    req.flash("error-interpretation", "Select at least one situation you need an interpreter for");
  }

  if (shouldRedirectToTypes) {
    res.redirect("types");
    return;
  }

  req.session.answers.translationTypes = translationTypes;
  req.session.answers.interpretationTypes = interpretationTypes;

  if (req.query.return === "results") {
    res.redirect("result");
    return;
  }

  res.redirect("disclaimer");
}

function TranslationTypesItemsVM() {
  return [
    { text: "Select all", value: "all", hint: { text: "Show all translators" } },
    ...translationSpecialties.map(questionDataAsCheckboxes),
  ];
}

function InterpretationTypesItemsVM() {
  return [
    { text: "Select all", value: "all", hint: { text: "Show all interpreters" } },
    ...interpretationServices.map(questionDataAsCheckboxes),
  ];
}

function questionDataAsCheckboxes({ text, value, description }: QuestionData) {
  return {
    text,
    value,
    hint: { text: description },
  };
}
