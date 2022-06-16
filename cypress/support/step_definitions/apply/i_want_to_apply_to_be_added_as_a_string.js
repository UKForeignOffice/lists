const base = "/application/";
const urls = {
  lawyers: `${base}lawyers`,
};

Given("I want to apply to be added as a {string}", (profession) => {
  cy.visit(urls[profession]);
  cy.findByRole("button", { name: "Reject analytics cookies" }).click();
  cy.findByRole("button", { name: "Start now" }).click();
});
