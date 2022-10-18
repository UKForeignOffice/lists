/* eslint-disable */
And("I see page with heading {string}", (pageHeading) => {
  cy.findByRole("heading", {name: pageHeading});
});
