import type { NextFunction, Request, Response } from "express";
import { sanitisePracticeAreas } from "server/components/lists/find/helpers/sanitisePracticeAreas";
import { sanitiseServices } from "server/components/lists/find/helpers/sanitiseServices";
import { sanitiseLanguages } from "server/components/lists/find/helpers/sanitiseLanguages";
import { sanitiseTranslationTypes } from "server/components/lists/find/helpers/sanitiseTranslationTypes";
import { sanitiseInterpretationTypes } from "server/components/lists/find/helpers/sanitiseInterpretationTypes";
import { languageCodesToReadable } from "server/components/lists/find/helpers/languageCodeToReadable";
import type { ParsedQs } from "qs";

export function loadQueryParametersIntoSession(req: Request, res: Response, next: NextFunction) {
  const { serviceType, region, country } = req.query;
  req.session.answers = {
    region: region as string,
    country: queryParameterValueAsString(country),
    disclaimer: true,
  };

  if (serviceType === "funeralDirectors") {
    loadFuneralDirectorsQueryParameters(req, res, next);
    return;
  }

  if (serviceType === "translatorsInterpreters") {
    loadTranslatorsInterpretersQueryParameters(req, res, next);
    return;
  }

  if (serviceType === "lawyers") {
    loadLawyersQueryParameters(req, res, next);
    return;
  }
  next();
}
function loadFuneralDirectorsQueryParameters(req: Request, res: Response, next: NextFunction) {
  req.session.answers = {
    ...req.session.answers,
    practiceAreas: sanitisePracticeAreas(req.query["practice-area"] as string),
    repatriation: req.query.repatriation === "yes",
    insurance: req.query.insurance === "yes",
    region: queryParameterValueAsString(req.query.region),
    country: queryParameterValueAsString(req.query.country),
    serviceType: "funeral-directors",
  };

  next();
}

function loadTranslatorsInterpretersQueryParameters(req: Request, res: Response, next: NextFunction) {
  const {
    servicesProvided = "",
    languagesProvided = "",
    translationSpecialties = "",
    interpreterServices = "",
  }: {
    servicesProvided?: string;
    languagesProvided?: string;
    translationSpecialties?: string;
    interpreterServices?: string;
  } = req.query;

  const validatedQueryParams = {
    servicesProvided: sanitiseServices(servicesProvided.split(",")),
    languagesProvided: sanitiseLanguages(languagesProvided.split(",")),
    translationSpecialties: sanitiseTranslationTypes(translationSpecialties.split(",")),
    interpretationServices: sanitiseInterpretationTypes(interpreterServices.split(",")),
  };

  req.session.answers = {
    ...req.session.answers,
    languages: validatedQueryParams.languagesProvided,
    languagesReadable: languageCodesToReadable(validatedQueryParams.languagesProvided),
    interpretationTypes: validatedQueryParams.interpretationServices,
    translationTypes: validatedQueryParams.translationSpecialties,
    services: validatedQueryParams.servicesProvided,
    serviceType: "translators-interpreters",
  };

  next();
}

function loadLawyersQueryParameters(req: Request, res: Response, next: NextFunction) {
  const practiceArea = (req.query.practiceArea ?? "") as string;
  req.session.answers!.practiceAreas = sanitisePracticeAreas(practiceArea.split(","));
  req.session.answers!.serviceType = "lawyers";

  next();
}

function queryParameterValueAsString(value: string | string[] | ParsedQs | ParsedQs[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) as string;
}
