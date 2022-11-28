/* eslint-disable */
And("the following users exist", (table) => {
  const rows = table.hashes();

  rows.forEach((row) => {
    cy.task("db", {
      operation: "user.upsert",
      variables: {
        create: {
          email: row.email,
          jsonData: { roles: [row.roles] },
        },
        update: {
          jsonData: { roles: [row.roles] },
        },
        where: {
          email: row.email,
        },
      },
    });
  });
});
