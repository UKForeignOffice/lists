/* eslint-disable */
And("I do not see {string} on the page", (string) => {
    cy.findByText(string).should("not.exist");
});