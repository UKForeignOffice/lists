Given("{string} is unpinned", () => {
  cy.findByRole("button", {
    value: "pin",
  });
});
