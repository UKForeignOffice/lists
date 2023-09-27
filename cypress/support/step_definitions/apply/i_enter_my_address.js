import { nanoid } from "nanoid";

const defaultAddress = {
  lineOne: "Lungotevere Castello",
  lineTwo: "50",
  town: "Roma",
  postCode: "00193",
  country: "Italy",
};

When("I enter my address {string} {string} {string} {string} {string}", (lineOne, LineTwo, town, postCode, country) => {
  cy.findByRole("textbox", { name: "Company name" }).type(nanoid(5));
  cy.findByRole("textbox", { name: "Address line 1" }).type(lineOne || defaultAddress.lineOne);
  cy.findByRole("textbox", { name: "Address line 2 (Optional)" }).type(LineTwo || defaultAddress.lineTwo);

  cy.findByRole("textbox", { name: "Town or city" }).type(town || defaultAddress.town);

  cy.findByRole("textbox", {
    name: "Post code / area code",
  }).type(postCode || defaultAddress.postCode);

  cy.get("select").select(country);

  cy.findByRole("button").click();
});
