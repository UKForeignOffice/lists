/* eslint-disable */
Given("I click on the link from the confirmation email", () => {
  cy.task("db", {
    operation: "listItem.findFirst",
    variables: {
      take: 1,
    },
  }).then(resp => {
    cy.visit(`/annual-review/confirm/${resp.reference}`)
  });
});
