When("a related link exists", () => {
  const jsonData = {
    users: ["smoke@cautionyourblast.com"],
    relatedLinks: [{ url: "https://gov.uk", text: "How to find eggs" }],
  };

  cy.task("db", {
    operation: "user.findUnique",
    variables: {
      where: {
        email: "smoke@cautionyourblast.com",
      },
    },
  }).then(result => {
    cy.task("db", {
      operation: "list.upsert",
      variables: {
        create: {
          type: "lawyers",
          reference: "SMOKE",
          nextAnnualReviewStartDate: null,
          jsonData,
          country: {
            connect: {
              name: "Eurasia",
            },
          },
          users: {
            connect: { id: result.id }
          }
        },
        update: {
          type: "lawyers",
          jsonData,
          nextAnnualReviewStartDate: null,
          items: {
            deleteMany: {},
          },
          users: {
            connect: { id: result.id }
          }
        },
        where: {
          reference: "SMOKE",
        },
      },
    });
  });

});
