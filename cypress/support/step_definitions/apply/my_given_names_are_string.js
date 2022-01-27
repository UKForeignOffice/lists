import { nanoid } from "nanoid";

When("my given names are {string}", (givenNames) => {
  cy.findByRole("textbox", { name: "First and middle names" }).type(givenNames);
  cy.findByRole("textbox", { name: "Last name" }).type(nanoid(5));
  cy.findByRole("button").click();
});
