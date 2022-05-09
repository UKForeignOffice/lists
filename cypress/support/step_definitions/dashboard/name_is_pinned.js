Given("{string} is unpinned", () => {
  cy.findByRole("button", {
    value: "unpin",
  });
});
