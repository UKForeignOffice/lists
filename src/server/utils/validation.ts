import Joi from "joi";
import { get } from "lodash";
import { countriesList } from "server/services/metadata";
import * as config from "server/config";
import { AuditEvent, ListItemEvent } from "@prisma/client";
import { AuditListItemEventName } from "server/models/types";

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
  if (config.isCybDev || config.isSmokeTest) {
    return isValidEmailAddress(email);
  } else {
    return isValidEmailAddress(email) && GOV_UK_EMAIL_REGEX.test(email);
  }
}

export function isCountryNameValid(countryName: string): boolean {
  return countriesList.some((country) => country.value === countryName);
}

export function throwIfConfigVarIsUndefined(varName: string): void {
  if (!get(config, varName)) {
    throw new Error(`Server config variable ${varName} is missing`);
  }
}

export interface EventMetaData {
  auditEvent: AuditEvent | ListItemEvent;
  auditListItemEventName: AuditListItemEventName;
}
