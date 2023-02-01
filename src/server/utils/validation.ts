import Joi from "joi";
import { get } from "lodash";
import { countriesList } from "server/services/metadata";
import * as config from "server/config";
import { AuditEvent, ListItemEvent } from "@prisma/client";
import { AuditListItemEventName } from "server/models/types";

export function isValidEmailAddress(email: string): boolean {
  const schema = Joi.string().email().lowercase().options({ convert: true });
  const result = schema.validate(email);

  if (result.error) {
    return false;
  }

  const domain = result.value.split("@")[1];
  const acceptedDomainSchema = Joi.string()
    .domain()
    .valid(...config.DEFAULT_ALLOWED_EMAIL_DOMAINS, ...config.ALLOWED_EMAIL_DOMAINS);
  const domainResult = acceptedDomainSchema.validate(domain);

  return !domainResult.error;
}

export function isGovUKEmailAddress(email: string): boolean {
  return isValidEmailAddress(email);
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
