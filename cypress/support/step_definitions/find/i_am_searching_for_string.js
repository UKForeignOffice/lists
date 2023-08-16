const base = "/find/";
Given("I am searching for {string}", (serviceType) => {
  cy.visit(`${base}${serviceType}`);
  cy.findByRole("button", { name: "Reject analytics cookies" }).click();
});
