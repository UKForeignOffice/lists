Then("I should see the complete banner with the {string} responded text", (respondants) => {
  cy.findByRole("region", { name: "Annual review is complete" });
  let expectedText = "1 service provider was removed from the list as they did not respond by";

  if (respondants === "all") {
    expectedText = "All service providers responded";
  } else if (respondants === "some") {
    expectedText = "1 service provider did not respond and was";
  }

  cy.findByText(expectedText, { exact: false });
});