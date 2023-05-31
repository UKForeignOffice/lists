import Joi from "joi";
import { countriesList } from "server/services/metadata";
import * as config from "server/config";
import type { AuditEvent, ListItemEvent } from "@prisma/client";
import type { AuditListItemEventName } from "server/models/types";
import { throwIfConfigVarIsUndefined as throwIfUndefined } from "shared/getNotifyClient";

const GOV_UK_EMAIL_REGEX = /gov\.uk$/i;

export function isValidEmailAddress(email: string): boolean {
  const schema = Joi.string().email();
  const result = schema.validate(email);

  return result.error === undefined;
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

export const throwIfConfigVarIsUndefined = throwIfUndefined;

export interface EventMetaData {
  auditEvent: AuditEvent | ListItemEvent;
  auditListItemEventName: AuditListItemEventName;
}
