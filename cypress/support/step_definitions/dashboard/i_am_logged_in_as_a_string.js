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

  cy.task("log", `VISITED login page, submitting enmail address to login`);

  cy.get("#email-address").type("ali+test@cautionyourblast.com{enter}");

  cy.task("log", `SUBMITTED login form.....`);
});
