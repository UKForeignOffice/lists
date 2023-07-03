import type { Request, Response } from "express";
import { sanitiseLanguages } from "server/components/lists/find/helpers/sanitiseLanguages";
import { getLanguagesRows } from "server/models/listItem/providers/helpers";
import { languages } from "server/services/metadata";

export function get(req: Request, res: Response) {
  const sanitisedLanguages = sanitiseLanguages(req.session.answers?.languages);

  if (req.query.remove) {
    const { languages: sessionLanguages = [] } = req.session.answers!;
    const languagesAfterRemoving = sessionLanguages.filter((language) => language !== req.query.remove);

    req.session.answers!.languages = languagesAfterRemoving;
    req.session.answers!.languagesReadable = languagesAfterRemoving.map((lang) => languages[lang]);
    res.redirect("summary");
    return;
  }

  const languagesRows = getLanguagesRows(sanitisedLanguages);
  if (languagesRows.rows.length === 0) {
    req.flash("error", "You must select the language(s) you need translating or interpreting");
    res.redirect(`./../languages`);
    return;
  }

  res.render("lists/find/translators-interpreters/languages-summary.njk", {
    languagesRows: getLanguagesRows(sanitisedLanguages),
  });
}
