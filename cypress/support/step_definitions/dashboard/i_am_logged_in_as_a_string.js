Given("I am logged in as a {string}", (role) => {
  cy.task("db", {
    operation: "user.upsert",
    variables: {
      create: {
        email: "ali+test@cautionyourblast.com",
        jsonData: { roles: [role] },
      },
      update: {
        jsonData: { roles: [role] },
      },
      where: {
        email: "ali+test@cautionyourblast.com",
      },
    },
  });

  cy.visit("localhost:3000/login");
  cy.findByRole("textbox").type("ali+test@cautionyourblast.com{enter}");
});
