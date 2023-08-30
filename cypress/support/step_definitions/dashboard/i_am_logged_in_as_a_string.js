/* eslint-disable */
Given("I am logged in as a {string}", (role) => {
  const roles = role === "Administrator" ? { roles: [role] } : { roles: [] };
  cy.task("db", {
    operation: "user.upsert",
    variables: {
      create: {
        email: "smoke@cautionyourblast.com",
        jsonData: roles,
      },
      update: {
        jsonData: roles,
      },
      where: {
        email: "smoke@cautionyourblast.com",
      },
    },
  });

  cy.visit("/login");
  cy.get("#email-address").type(`smoke@cautionyourblast.com{enter}`);
});
