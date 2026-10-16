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
  .items(
    "all",
    ...interpretationServices.map((type) => type.value),
    ...interpretationServices.map((type) => type.value.toLowerCase())
  )
  .single();

const validTranslationTypes = Joi.array()
  .items(
    "all",
    ...translationSpecialties.map((type) => type.value),
    ...translationSpecialties.map((type) => type.value.toLowerCase())
  )
  .single();

export const translatorsInterpretersSchema = Joi.object({
  languages: validLanguages.required(),
  languagesReadable: validReadableLanguages.required(),
  services: validServices.required(),
  interpretationTypes: Joi.when("$services", {
    is: Joi.array().single().has(Joi.valid("interpretation")).required(),
    then: validInterpretationTypes.min(1).required(),
    otherwise: validInterpretationTypes.optional(),
  }),
  translationTypes: validTranslationTypes.when("$services", {
    is: Joi.array().single().has(Joi.valid("translation")).required(),
    then: validTranslationTypes.min(1).required(),
    otherwise: validTranslationTypes.optional(),
  }),
});
