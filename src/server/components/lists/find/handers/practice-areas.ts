import { legalPracticeAreasList } from "server/services/metadata";
import Joi from "joi";
import { URLSearchParams } from "url";
import type { Request, Response } from "express";

export function get(req: Request, res: Response) {
  const answeredPracticeAreas = req.session.answers?.practiceAreas?.split?.(",") ?? [];

  const items = legalPracticeAreasList.map((area) => ({
    value: area,
    text: area,
    checked: answeredPracticeAreas.includes(area),
  }));

  res.render("lists/find/lawyers/practice-areas.njk", {
    practiceAreas: [{ text: "Select all", value: "All" }, ...items],
  });
}

export function post(req: Request, res: Response) {
  const { body } = req;
  const { practiceArea = [] } = body;
  const validPracticeAreas = Joi.array()
    .items(...legalPracticeAreasList)
    .single();

  const { value = [] } = validPracticeAreas.validate(practiceArea, {
    stripUnknown: { arrays: true },
    convert: true,
  });

  if (value?.length === 0) {
    req.flash("error", "You must select at least one area of law");
    res.redirect(req.originalUrl);
    return;
  }

  const query = new URLSearchParams({ ...req.query, "practice-area": value });

  if (req.session.answers?.disclaimer === true) {
    res.redirect(`result?${query.toString()}`);
    return;
  }

  res.redirect(`disclaimer?${query.toString()}`);
}
