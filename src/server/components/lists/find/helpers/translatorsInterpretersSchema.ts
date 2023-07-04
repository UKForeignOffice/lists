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

const validServices = Joi.array().items("translation", "interpretation").single();

const validInterpretationTypes = Joi.array()
  .items("all", ...interpretationServices.map((type) => type.value))
  .single();

const validTranslationTypes = Joi.array()
  .items("all", ...translationSpecialties.map((type) => type.value))
  .single();

export const translatorsInterpretersSchema = Joi.object({
  languages: validLanguages,
  languageReadable: validReadableLanguages,
  services: validServices,
  interpretationTypes: validInterpretationTypes,
  translationTypes: validTranslationTypes,
});
