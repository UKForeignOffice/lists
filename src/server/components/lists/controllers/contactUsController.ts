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
}

export function getContactUsPage(req: Request, res: Response) {
  const fieldTitles = {
    country: "Which country list are you contacting us about?",
    detail: "Provide details of why you are contacting us",
    email: "Enter your email address",
    name: "Enter your name",
    providerCompanyName: "What is their company name? (Optional)",
    providerName: "What is the service provider's name",
    serviceType: "What service type are you contacting us about?",
  };
  const [errors] = req.flash("errors") as unknown as string[];

  if (!errors) {
    res.render("help/contact-us", { csrfToken: getCSRFToken(req), fieldTitles, countriesList });
    return;
  }

  const errorArray = errors.split(",") as Array<keyof Partial<ContactUsFormFields>>;
  const errorsObj = errorArray.reduce(
    (acc, error) => ({
      ...acc,
      [error]: `${fieldTitles[error]} is required`,
    }),
    {}
  ) as Partial<ContactUsFormFields>;

  const errorList = errorArray.map((error) => ({
    text: errorsObj[error],
    href: `#${error}`,
  }));

  res.render("help/contact-us", {
    csrfToken: getCSRFToken(req),
    fieldTitles,
    countriesList,
    errors: errorsObj,
    errorList,
  });
}

export async function postContactUsPage(req: Request, res: Response, next: NextFunction) {
  const contactUsFormSchema = Joi.object({
    country: Joi.string(),
    detail: Joi.string(),
    email: Joi.string().email(),
    name: Joi.string(),
    providerCompanyName: Joi.string().allow(null, ""),
    providerName: Joi.string(),
    serviceType: Joi.string().valid("lawyers", "funeral-directors", "translators-interpreters"),
    _csrf: Joi.string(),
  });
  const formFields = req.body as ContactUsFormFields;
  const { value: validatedFormFields, error } = contactUsFormSchema.validate(formFields);
  const { _csrf, ...dataWithoutCSRF } = validatedFormFields;
  const formFieldKeys = Object.keys(validatedFormFields) as Array<keyof ContactUsFormFields>;

  const errors: string[] = [];
  const nonRequiredFields = ["providerCompanyName", "_csrf"];

  if (!formFieldKeys.includes("serviceType")) {
    formFieldKeys.push("serviceType");
  }

  formFieldKeys.forEach((key) => {
    if (!validatedFormFields[key] && !nonRequiredFields.includes(key)) {
      errors.push(key);
    }
  });

  if (errors.length) {
    req.flash("errors", errors.toString());
    res.redirect("/help/contact-us");
    return;
  }

  if (error) {
    logger.error(`postContactUsPage Error: Validation failed - ${error.message}`);
    next(error);
    return;
  }

  try {
    const personalisation = {
      emailSubject: `${validatedFormFields.serviceType} in ${validatedFormFields.country}: Find service contact form`,
      emailPayload: Object.entries(dataWithoutCSRF).join("\r\n\n ## \r\n"),
    };

    await sendContactUsEmail(personalisation);
    res.redirect("/help/contact-us-confirm");
  } catch (error) {
    logger.error(`postContactUsPage Error: ${error.errors ?? error.message}`);
    next(error);
  }
}
