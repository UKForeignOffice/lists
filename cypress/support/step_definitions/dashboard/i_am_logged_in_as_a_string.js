/* eslint-disable */
Given("I am logged in as a {string}", (role) => {
  cy.task("db", {
    operation: "user.upsert",
    variables: {
      create: {
        email: roleEmails[role],
        jsonData: { roles: [role] },
      },
      update: {
        jsonData: { roles: [role] },
      },
      where: {
        email: roleEmails[role],
      },
    },
  });

  cy.visit("/login");
  cy.get("#email-address").type(`${roleEmails[role]}{enter}`);
});

const roleEmails = {
  SuperAdmin: "smoke@cautionyourblast.com",
  ListsCreator: "reptile@cautionyourblast.com",
};
