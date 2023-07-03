import type { Request, Response } from "express";
import { languages } from "server/services/metadata";

import { sanitiseLanguages } from "./../../helpers/sanitiseLanguages";

import querystring from "querystring";
import { getLanguagesRows } from "server/models/listItem/providers/helpers";

export function get(req: Request, res: Response) {
  const languagesVM = Object.entries(languages).map(([value, text]) => ({ value, text }));
  const sanitisedLanguages = sanitiseLanguages(req.query.languages);
  const query = querystring.encode(req.query);

  res.render("lists/find/translators-interpreters/languages.njk", {
    languages: [{ text: "", value: "" }, ...languagesVM],
    languagesRows: getLanguagesRows(sanitisedLanguages, query),
  });
}

export function post(req: Request, res: Response) {
  let selectedLanguages = sanitiseLanguages(req.query.languages);
  const { language, action } = req.body;
  if (action === "add") {
    selectedLanguages.push(language);
    selectedLanguages = sanitiseLanguages(selectedLanguages);

    if (selectedLanguages.length === 0) {
      req.flash("error", "You must enter the language(s) you need translating or interpreting");
    }

    req.session.answers = {
      ...req.session.answers,
      languages: selectedLanguages,
      languagesReadable: selectedLanguages.map((lang) => languages[lang]),
    };

    const query = querystring.encode({
      ...req.query,
      languages: selectedLanguages,
    });

    res.redirect(`languages?${query}`);
    return;
  }

  const query = querystring.encode({
    ...req.query,
    languages: selectedLanguages,
  });

  res.redirect(`languages/summary?${query}`);
}
