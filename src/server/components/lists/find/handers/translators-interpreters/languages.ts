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
  const languages = sanitiseLanguages(req.query.languages);
  const { language, action } = req.body;
  console.log(action);
  if (action === "add") {
    languages.push(language);
    req.session.languages = languages;

    const query = querystring.encode({
      ...req.query,
      languages: sanitiseLanguages(languages),
    });

    res.redirect(`languages?${query}`);
    return;
  }

  const query = querystring.encode({
    ...req.query,
    languages,
  });

  res.redirect(`languages/summary?${query}`);
}
