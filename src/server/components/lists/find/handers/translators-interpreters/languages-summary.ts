import type { Request, Response } from "express";
import { sanitiseLanguages } from "server/components/lists/find/helpers/sanitiseLanguages";
import querystring from "querystring";
import { getLanguagesRows } from "server/models/listItem/providers/helpers";

export function get(req: Request, res: Response) {
  const sanitisedLanguages = sanitiseLanguages(req.query.languages);
  const query = querystring.encode(req.query);

  const languagesRows = getLanguagesRows(sanitisedLanguages, query);
  if (languagesRows.rows.length === 0) {
    req.flash("error", "You must select the language(s) you need translating or interpreting");
    res.redirect(`./../languages?${query}`);
    return;
  }

  res.render("lists/find/translators-interpreters/languages-summary.njk", {
    languagesRows: getLanguagesRows(sanitisedLanguages, query),
  });
}
