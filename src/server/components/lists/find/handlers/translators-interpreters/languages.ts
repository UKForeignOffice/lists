import type { Request, Response } from "express";
import { languages } from "server/services/metadata";

import { sanitiseLanguages } from "./../../helpers/sanitiseLanguages";
import { getLanguagesRows } from "server/models/listItem/providers/helpers";
import querystring from "querystring";

const languagesAsArray = splitLanguagesIntoArray();

export function get(req: Request, res: Response) {
  const shouldReturn = req.query.return === "results";
  const queryString = querystring.encode({ ...(shouldReturn && { return: "results" }) });

  if (req.query.remove) {
    const { languages: sessionLanguages = [] } = req.session.answers!;
    const languagesAfterRemoving = sessionLanguages.filter((language) => language !== req.query.remove);

    req.session.answers!.languages = languagesAfterRemoving;
    req.session.answers!.languagesReadable = languagesAfterRemoving.map((lang) => languages[lang]);
    res.redirect(`languages?${queryString}`);

    return;
  }
  const languagesViewModel = languagesAsArray;
  const sanitisedLanguages = sanitiseLanguages(req.session.answers!.languages);

  res.render("lists/find/translators-interpreters/languages.njk", {
    languages: [{ text: "", value: "" }, ...languagesViewModel],
    languagesRows: getLanguagesRows(sanitisedLanguages),
  });
}

export function post(req: Request, res: Response) {
  let selectedLanguages = sanitiseLanguages(req.session.answers!.languages);
  const { language, action } = req.body;
  const shouldReturn = req.session.answers?.disclaimer;
  const queryString = querystring.encode({ ...(shouldReturn && { return: "results" }) });
  if (action === "add") {
    selectedLanguages.push(language);
    selectedLanguages = sanitiseLanguages(selectedLanguages);

    if (selectedLanguages.length === 0) {
      req.flash("error", "You must enter the language(s) you need translating or interpreting");
    }

    req.session.answers!.languages = selectedLanguages;
    req.session.answers!.languagesReadable = selectedLanguages.map((lang) => languages[lang]);
    res.redirect(`languages?${queryString}`);
    return;
  }

  if (shouldReturn) {
    res.redirect("result");
    return;
  }

  res.redirect(`languages/summary`);
}

/**
 * Splits metadata.languages into an array of objects. Each object is a single key value pair.
 * ```
 *   [
 *     { aa: "Afar" },
 *     { ab: "Abkhazian" }
 *   ]
 * ```
 */
function splitLanguagesIntoArray() {
  return Object.entries(languages).map(languageEntriesToObject);
}

function languageEntriesToObject([languageCode, languageName]: [string, string]) {
  return {
    [languageCode]: languageName,
  };
}
