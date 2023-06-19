import type { NextFunction, Request, Response } from "express";
import { getCSRFToken } from "server/components/cookies/helpers";
import { countriesList } from "server/services/metadata";
import { sendContactUsEmail } from "server/services/govuk-notify";
import { logger } from "server/services/logger";

export function getContactUsPage(req: Request, res: Response) {
  const [errors] = req.flash("errors") as unknown as string[];
  const fieldTitles = {
    country: "Which country list are you contacting us about?",
    detail: "Provide details of why you are contacting us",
    email: "Enter your email address",
    name: "Enter your name",
    providerCompanyName: "What is their company name? (Optional)",
    providerName: "What is the service provider's name",
    serviceType: "What service type are you contacting us about?",
  };

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

interface ContactUsFormFields {
  country: string;
  detail: string;
  email: string;
  name: string;
  providerCompanyName?: string;
  providerName: string;
  serviceType: string;
}

export async function postContactUsPage(req: Request, res: Response, next: NextFunction) {
  const formFields = req.body as ContactUsFormFields;
  const errors: string[] = [];
  const nonRequiredFields = ["providerCompanyName", "_csrf"];
  const formFieldKeys = Object.keys(formFields) as Array<keyof ContactUsFormFields>;

  if (!formFieldKeys.includes("serviceType")) {
    formFieldKeys.push("serviceType");
  }

  formFieldKeys.forEach((key) => {
    if (!formFields[key] && !nonRequiredFields.includes(key)) {
      errors.push(key);
    }
  });

  if (errors.length) {
    req.flash("errors", errors.toString());
    res.redirect("/help/contact-us");
    return;
  }

  try {
    const personalisation = {
      emailSubject: `${formFields.serviceType} in ${formFields.country}: Apply service contact form`,
      emailPayload: Object.entries(formFields),
    };
    await sendContactUsEmail(personalisation);
    res.redirect("/help/contact-us"); // go to the email submitted page
  } catch (error) {
    logger.error(`postContactUsPage Error: ${error.errors ?? error.message}`);
    next(error);
  }
}
