import type { NextFunction, Request, Response } from "express";
import { getCSRFToken } from "server/components/cookies/helpers";
import { countriesList } from "server/services/metadata";
import { sendContactUsEmail } from "server/services/govuk-notify";
import { logger } from "server/services/logger";
import Joi from "joi";

interface ContactUsFormFields {
  country: string;
  detail: string;
  email: string;
  name: string;
  providerCompanyName?: string;
  providerName: string;
  serviceType: string;
  _csrf?: string;
}

export const fieldTitles: ContactUsFormFields = {
  country: "Which country list are you contacting us about?",
  detail: "Provide details of why you are contacting us",
  email: "Enter your email address",
  name: "Enter your name",
  providerCompanyName: "What is their company name? (Optional)",
  providerName: "What is the service provider's name",
  serviceType: "What service type are you contacting us about?",
};

export function getComplaintForm(req: Request, res: Response) {
  const [errors] = req.flash("errors") as unknown as string[];
  const errorList = errors ? (JSON.parse(errors) as Array<Record<string, string>>) : null;

  if (!errorList) {
    res.render("help/complaints", { csrfToken: getCSRFToken(req), fieldTitles, countriesList });
    return;
  }

  const errorsObj = errorList.reduce(
    (acc, error) => ({
      ...acc,
      [error.key]: error.text,
    }),
    {}
  ) as Partial<ContactUsFormFields>;

  res.render("help/complaints", {
    csrfToken: getCSRFToken(req),
    fieldTitles,
    countriesList,
    errors: errorsObj,
    errorList,
  });
}

export async function postComplaintForm(req: Request, res: Response, next: NextFunction) {
  const ERROR_MESSAGES = {
    "string.empty": "{{#label}} is required",
  };

  const contactUsFormSchema = Joi.object({
    country: Joi.string().label(fieldTitles.country).required().messages(ERROR_MESSAGES),
    detail: Joi.string().label(fieldTitles.detail).required().messages(ERROR_MESSAGES),
    email: Joi.string().email().label(fieldTitles.email).required().messages(ERROR_MESSAGES),
    name: Joi.string().label(fieldTitles.name).required().messages(ERROR_MESSAGES),
    providerCompanyName: Joi.string().allow(null, ""),
    providerName: Joi.string().label(fieldTitles.providerName).required().messages(ERROR_MESSAGES),
    serviceType: Joi.string().label(fieldTitles.serviceType).required().messages(ERROR_MESSAGES),
  });

  const { _csrf, ...formFields } = req.body as ContactUsFormFields;
  const { value: validatedFormFields, error: validationError } = contactUsFormSchema.validate(formFields, {
    abortEarly: false,
    stripUnknown: true,
    errors: {
      wrap: {
        label: false,
      },
    },
  });

  if (validationError) {
    const errors = validationError.details.map((detail) => {
      const { key } = detail.context!;
      return {
        text: detail.message,
        href: `#${key}`,
        key,
      };
    });
    req.flash("errors", JSON.stringify(errors));
    logger.error(`postComplaintForm Error: Validation failed - ${validationError.message}`);
    res.redirect("/help/complaints");
    return;
  }

  try {
    const personalisation = {
      emailSubject: `${validatedFormFields.serviceType} in ${validatedFormFields.country}: Find service complaint form`,
      emailPayload: formatFieldData(validatedFormFields).join("\r\n\n ## \r\n"),
    };

    await sendContactUsEmail(personalisation);
    res.redirect("/help/complaints-confirm");
  } catch (error) {
    logger.error(`postComplaintForm Error: ${error.errors ?? error.message}`);
    next(error);
  }
}

function formatFieldData(formeFields: ContactUsFormFields) {
  return Object.entries(formeFields).map(([key, value]) => {
    return `${fieldTitles[key as keyof ContactUsFormFields]}: ${value}`;
  });
}
