import { legalPracticeAreasList } from "server/services/metadata";
import Joi from "joi";
import { URLSearchParams } from "url";
import type { Request, Response } from "express";
import { sanitisePracticeAreas } from "server/components/lists/find/helpers/sanitisePracticeAreas";

export function get(req: Request, res: Response) {
  const answeredPracticeAreas = req.session.answers?.practiceAreas?.split?.(",") ?? [];

  const items = legalPracticeAreasList.map((area) => ({
    value: area,
    text: area,
    checked: answeredPracticeAreas.includes(area),
  }));

  res.render("lists/find/lawyers/practice-areas.njk", {
    practiceAreas: [{ text: "Select all", value: "All" }, ...items],
    answers: req.session.answers,
  });
}

export function post(req: Request, res: Response) {
  const { body } = req;
  const { practiceArea = [] } = body;

  const sanitisedPracticeAreas = sanitisePracticeAreas(practiceArea);

  if (sanitisedPracticeAreas?.length === 0) {
    req.flash("error", "You must select at least one area of law");
    res.redirect(req.originalUrl);
    return;
  }

  const query = new URLSearchParams({ ...req.query, "practice-area": sanitisedPracticeAreas });

  req.session.answers = {
    ...req.session.answers,
    practiceAreas: sanitisedPracticeAreas.toString(),
  };

  if (req.session.answers?.disclaimer === true) {
    res.redirect(`result?${query.toString()}`);
    return;
  }

  res.redirect(`disclaimer?${query.toString()}`);
}
