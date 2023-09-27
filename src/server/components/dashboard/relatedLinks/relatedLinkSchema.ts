import Joi from "joi";
import type { CustomHelpers } from "joi";

const ERROR_MESSAGES = {
  "string.url.govuk": "You can only link to GOV.UK",
  "any.required": "Enter a {{#label}}",
  "string.empty": "Enter a {{#label}}",
};

export const relatedLinkSchema = Joi.object({
  text: Joi.string().label("page title").required().messages(ERROR_MESSAGES),
  url: Joi.string().label("URL").required().custom(govukUrlValidation).messages(ERROR_MESSAGES),
});
function govukUrlValidation<V extends string>(value: V, helper: CustomHelpers) {
  let stringToValidate = value.toLowerCase();

  if (!value.startsWith("https://")) {
    stringToValidate = `https://${value}`;
  }

  let url;
  try {
    url = new URL(stringToValidate);
  } catch (e) {
    return helper.error("string.url.govuk");
  }

  const ALLOWED_HOSTNAMES = ["gov.uk", "www.gov.uk"];

  if (!ALLOWED_HOSTNAMES.includes(url.hostname)) {
    return helper.error("string.url.govuk");
  }

  return url.toString();
}
