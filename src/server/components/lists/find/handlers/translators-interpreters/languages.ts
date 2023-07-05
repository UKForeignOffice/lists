import type { Request, Response } from "express";
import { languages } from "server/services/metadata";

import { sanitiseLanguages } from "./../../helpers/sanitiseLanguages";
import { getLanguagesRows } from "server/models/listItem/providers/helpers";
import querystring from "querystring";

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
  const languagesVM = Object.entries(languages).map(([value, text]) => ({ value, text }));
  const sanitisedLanguages = sanitiseLanguages(req.session.answers!.languages);

  res.render("lists/find/translators-interpreters/languages.njk", {
    languages: [{ text: "", value: "" }, ...languagesVM],
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
