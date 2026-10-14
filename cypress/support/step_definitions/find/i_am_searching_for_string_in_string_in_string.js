const base = "/find?serviceType=";
const urls = {
  lawyers: `${base}lawyers`,
};

Given("I am searching for {string} in {string} in {string}", (profession, country, city) => {
  cy.visit(urls[profession]);
  cy.findByRole("button", { name: "Reject analytics cookies" }).click();
  cy.findByRole("link", { name: "Start" }).click();
  cy.findByRole("combobox").type(`${country}`);
  cy.intercept("POST", `/find/${profession}/country`).as("countrySearch");
  cy.findByRole("button", { name: "Continue" }).click();
  if (city) {
    cy.findByLabelText(`Where in ${country} do you want to find a lawyer`, {
      exact: false,
    }).type(`${city}{enter}`);
  }
});
