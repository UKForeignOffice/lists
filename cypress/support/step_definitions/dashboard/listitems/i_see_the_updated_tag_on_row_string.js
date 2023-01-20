Then("I {string} the updated tag on row {string}", (verb, rowTitle) => {
  const termElement = cy.findAllByText(rowTitle);
  if (verb === "see") {
    termElement.parent().contains("Updated");
  } else {
    termElement.parent().should("not.contain", "Updated");
  }
});
