import { relatedLinkSchema } from "../relatedLinkSchema";

describe("relatedLinkSchema", () => {
  test("normalises valid GOV.UK links", () => {
    const { value, error } = relatedLinkSchema.validate({
      text: "Page title",
      url: "www.gov.uk/example",
    });

    expect(error).toBeUndefined();
    expect(value).toEqual({
      text: "Page title",
      url: "https://www.gov.uk/example",
    });
  });

  test("returns the custom message for links outside GOV.UK", () => {
    const { error } = relatedLinkSchema.validate({
      text: "External page",
      url: "https://example.com",
    });

    expect(error?.details[0]).toMatchObject({
      type: "string.url.govuk",
      message: "You can only link to GOV.UK",
    });
  });

  test("uses the page-title message for an empty title", () => {
    const { error } = relatedLinkSchema.validate({
      text: "",
      url: "https://www.gov.uk",
    });

    expect(error?.details[0]).toMatchObject({
      type: "string.empty",
      message: 'Enter a "page title"',
    });
  });
});
