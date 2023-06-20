import type { Request, Response } from "express";
import { languages } from "server/services/metadata";
import { URLSearchParams } from "url";
import { sanitiseLanguages } from "server/components/lists/find/helpers/sanitiseLanguages";

export function get(req: Request, res: Response) {
  const languagesVM = Object.entries(languages).map(([value, text]) => ({ value, text }));
  // TODO: - add validation to req.params.languages, then send selectedLanguages to the render context.
  const selectedLanguages = languagesVM.filter();
  res.render("lists/find/translators-interpreters/languages.njk", {
    languages: [{ text: "", value: "" }, ...languagesVM],
    selectedLanguages: req.session.languages,
  });
}

export function post(req: Request, res: Response) {
  const { language } = req.body;
  let { languages = [] } = req.query;

  if (!Array.isArray(languages)) {
    languages = decodeURIComponent(languages).split(",");
  }

  languages.push(language);
  const sanitisedLanguages = sanitiseLanguages(languages);

  const params = new URLSearchParams({
    ...req.query,
    languages: sanitisedLanguages,
  });

  req.session.answers.languages = languages;

  res.redirect(`languages?${params.toString()}`);
}
