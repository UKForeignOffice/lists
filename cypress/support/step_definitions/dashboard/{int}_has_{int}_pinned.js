Given("{string} has {int} pinned", (email, itemId) => {
  cy.task("db", {
    operation: "user.update",
    variables: {
      where: {
        email,
      },
      data: {
        pinnedItems: {
          connect: itemId,
        },
      },
    },
  });
});
