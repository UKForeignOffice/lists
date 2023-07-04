import Joi from "joi";
import { interpretationServices, languages, translationSpecialties } from "server/services/metadata";

const languageCodes = Object.keys(languages);
const validLanguages = Joi.array()
  .items(...languageCodes)
  .single();

const languageValues = Object.values(languages);

const validReadableLanguages = Joi.array()
  .items(...languageValues)
  .single();

const validServices = Joi.array().items("translation", "interpretation").single().min(1);

const validInterpretationTypes = Joi.array()
  .items("all", ...interpretationServices.map((type) => type.value))
  .single();

const validTranslationTypes = Joi.array()
  .items("all", ...translationSpecialties.map((type) => type.value))
  .single();

export const translatorsInterpretersSchema = Joi.object({
  languages: validLanguages.required(),
  languagesReadable: validReadableLanguages.required(),
  services: validServices.required(),
  interpretationTypes: Joi.when("$services", {
    is: Joi.array().items("translation").only(),
    then: validInterpretationTypes.optional(),
    otherwise: validInterpretationTypes.required(),
  }),
  translationTypes: validTranslationTypes.when("$services", {
    is: Joi.array().items("interpretation").only(),
    then: validInterpretationTypes.optional(),
    otherwise: validTranslationTypes.required(),
  }),
});
