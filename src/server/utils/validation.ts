import Joi from "joi";
import { get } from "lodash";
import { countriesList } from "server/services/metadata";
import { isCISmokeTest, isCybDev } from "server/config";
import * as config from "server/config";

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
  if (isCybDev || isCISmokeTest) {
    return isValidEmailAddress(email);
  } else {
    return isValidEmailAddress(email) && GOV_UK_EMAIL_REGEX.test(email);
  }
}

export function isCountryNameValid(countryName: string): boolean {
  return countriesList.some((country) => country.value === countryName);
}

export function throwIfConfigVarIsUndefined(varName: string): void {
  if (get(config, varName) === undefined) {
    throw new Error(`Environment variable ${varName} is missing`);
  }
}
