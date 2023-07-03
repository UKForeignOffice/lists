import type { Request, Response } from "express";
import { translationSpecialties, interpretationServices } from "server/services/metadata";
import type { QuestionData } from "server/components/lists";
import { sanitiseTranslationTypes } from "server/components/lists/find/helpers/sanitiseTranslationTypes";
import { sanitiseInterpretationTypes } from "server/components/lists/find/helpers/sanitiseInterpretationTypes";
import querystring from "querystring";
import { sanitiseServices } from "server/components/lists/find/helpers/sanitiseServices";

export function get(req: Request, res: Response) {
  const services = sanitiseServices(req.query.services);

  res.render("lists/find/translators-interpreters/types.njk", {
    ...(services.includes("translation") && {
      translationTypes: {
        items: TranslationTypesItemsVM(),
      },
    }),
    ...(services.includes("interpretation") && {
      interpretationTypes: {
        items: InterpretationTypesItemsVM(),
      },
    }),
  });
}

export function post(req: Request, res: Response) {
  const translationTypes = sanitiseTranslationTypes(req.body.translation);
  const interpretationTypes = sanitiseInterpretationTypes(req.body.interpretation);
  const services = req.query.services;

  let shouldRedirectToTypes = false;
  if (services.includes("translation") && translationTypes.length === 0) {
    shouldRedirectToTypes = true;
    req.flash("error-translation", "Select at least one type of translation");
  }

  if (services.includes("interpretation") && translationTypes.length === 0) {
    shouldRedirectToTypes = true;
    req.flash("error-interpretation", "Select at least one situation you need an interpreter for");
  }

  const query = querystring.encode({
    ...req.query,
  });

  if (shouldRedirectToTypes) {
    res.redirect(`types?${query}`);
    return;
  }

  req.session.answers = {
    ...req.session.answers,
    translationTypes,
    interpretationTypes,
  };
  res.redirect(`disclaimer?${query}`);
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
