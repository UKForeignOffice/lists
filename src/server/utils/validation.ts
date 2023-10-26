import Joi from "joi";
import { countriesList } from "server/services/metadata";
import * as config from "server/config";
import type { AuditEvent, ListItemEvent } from "@prisma/client";
import type { AuditListItemEventName } from "server/models/types";
import { throwIfConfigVarIsUndefined as throwIfUndefined } from "shared/getNotifyClient";

export function isValidEmailAddress(email: string): boolean {
  const schema = Joi.string().email().lowercase().options({ convert: true });
  const { error } = schema.validate(email);

  return !error;
}

export function isAllowedEmailDomain(email: string): boolean {
  const domain = email.split("@")[1];
  const acceptedDomainSchema = Joi.string()
    .domain()
    .valid(...config.DEFAULT_ALLOWED_EMAIL_DOMAINS, ...config.ALLOWED_EMAIL_DOMAINS)
    .lowercase()
    .options({ convert: true });
  const domainResult = acceptedDomainSchema.validate(domain);

  return !domainResult.error;
}
export function isGovUKEmailAddress(email: string): boolean {
  return isValidEmailAddress(email) && isAllowedEmailDomain(email);
}

export function isCountryNameValid(countryName: string): boolean {
  return countriesList.some((country) => country.value === countryName);
}

export const throwIfConfigVarIsUndefined = throwIfUndefined;

export interface EventMetaData {
  auditEvent: AuditEvent | ListItemEvent;
  auditListItemEventName: AuditListItemEventName;
}
