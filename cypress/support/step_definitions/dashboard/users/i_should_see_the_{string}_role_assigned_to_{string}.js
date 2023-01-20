/* eslint-disable */
Then("I {string} see the {string} role assigned to {string}", (shouldSeeRole, role, email) => {
  const isRoleVisible = shouldSeeRole === "should";
  if (isRoleVisible) {
    cy.findByRole("rowheader", { name: email }).parent().contains(role);

  } else {
    cy.findByRole("rowheader", { name: email }).parent().should("not.contain.text", role);
  }
});
