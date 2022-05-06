Given("I am logged in as a {string}", (role) => {
  cy.task("db", {
    operation: "user.upsert",
    variables: {
      create: {
        email: "smoke@cautionyourblast.com",
        jsonData: { roles: [role] },
      },
      update: {
        jsonData: { roles: [role] },
      },
      where: {
        email: "smoke@cautionyourblast.com",
      },
    },
  });

  cy.visit("localhost:3000/login");
  cy.findByRole("textbox").type("smoke@cautionyourblast.com{enter}");
});
