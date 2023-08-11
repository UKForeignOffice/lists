When("the other eurasia lawyers have answered", () => {
  const eligible = ["eligible-1", "eligible-2", "eligible-3", "eligible-4"];

  eligible.forEach((reference) => {
    cy.task("db", {
      operation: "listItem.update",
      variables: {
        where: {
          reference,
        },
        data: {
          status: "CHECK_ANNUAL_REVIEW",
          history: {
            create: [
              {
                type: "CHECK_ANNUAL_REVIEW",
                time: new Date(),
                jsonData: {},
              },
            ],
          },
        },
      },
    });
  });
});
