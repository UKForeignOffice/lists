const sizes = {
  independent: "Independent lawyer / sole practitioner",
  small: "Small firm (up to 15 legal professionals)",
  medium: "Medium firm (16-349 legal professionals)",
  large: "Large firm (350+ legal professionals)",
};

When("my company is {string}", (size) => {
  cy.findByLabelText(sizes[size]).click();
  cy.findByRole("button").click();
});

When("I {string} represented british nationals before", (string) => {
  const have = string === "have";
  cy.findByText(have ? "Yes" : "No", { exact: false }).click();
  cy.findByRole("button").click();
});
