import Joi from "joi";
import { countriesList } from "server/services/metadata";

const GOV_UK_EMAIL_REGEX = /gov\.uk$/i;

export function isValidEmailAddress(email: string): boolean {
  const schema = Joi.string().email();
  const result = schema.validate(email);

  if (result.error === undefined) {
    return true;
  }

  return false;
}

export function isGovUKEmailAddress(email: string): boolean {
  return isValidEmailAddress(email) && GOV_UK_EMAIL_REGEX.test(email);
}

export function isCountryNameValid(countryName: string): boolean {
  return countriesList.some((country) => country.value === countryName);
}
