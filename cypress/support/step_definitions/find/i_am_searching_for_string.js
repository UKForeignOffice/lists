const base =
  "https://find-a-professional-service-abroad.service.forms.fcodev.org.uk/find?serviceType=";
const urls = {
  lawyers: `${base}lawyers`,
};

Given(
  "I am searching for {string} in {string} in {string}",
  (profession, country, city) => {
    cy.visit(urls[profession]);
    cy.findByRole("button", { name: "Reject analytics cookies" }).click();
    cy.findByRole("button", { name: "Continue" }).click();
    cy.findByRole("combobox").type(`${country}`);
    cy.findByRole("button", { name: "Continue" }).click();
    cy.findByRole("textbox").type(`${city}{enter}`);
  }
);
