import { legalPracticeAreasList } from "server/services/metadata";
import type { Request, Response } from "express";
import { sanitisePracticeAreas } from "server/components/lists/find/helpers/sanitisePracticeAreas";

export function get(req: Request, res: Response) {
  const answeredPracticeAreas = req.session.answers?.practiceAreas ?? [];

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
    res.redirect("practice-area");
    return;
  }

  req.session.answers = {
    ...req.session.answers,
    practiceAreas: sanitisedPracticeAreas,
  };

  if (req.session.answers?.disclaimer === true) {
    res.redirect(`result`);
    return;
  }

  res.redirect(`disclaimer`);
}
