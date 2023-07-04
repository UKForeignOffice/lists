import type { NextFunction, Request, Response } from "express";
import Joi from "joi";

export function checkIncompleteState(req: Request, res: Response, next: NextFunction) {
  const { serviceType } = req.params;
  const { answers = {} } = req.session;

  if (serviceType === "translators-interpreters") {
    const { services, interpretationTypes, translationTypes, languages } = answers;
  }
}

/**
 *
 * interface FuneralDirectorAnswers {
 *   practiceAreas: string[];
 *   repatriation: boolean;
 *   insurance: boolean;
 * }
 *
 * export interface TranslatorsInterpretersAnswers {
 *   languages: string[];
 *   languagesReadable: string[];
 *   services: string[];
 *   interpretationTypes: string[];
 *   translationTypes: string[];
 * }
 *
 * interface LawyersAnswers {
 *   practiceAreas: string[];
 * }
 */
