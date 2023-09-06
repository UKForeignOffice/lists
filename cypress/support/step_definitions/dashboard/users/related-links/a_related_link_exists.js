When("a related link exists", () => {
  const jsonData = {
    users: ["smoke@cautionyourblast.com"],
    relatedLinks: [{ url: "https://gov.uk", text: "How to find eggs" }],
  };

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
          connect: { email: "smoke@cautionyourblast.com", }
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
          connect: { email: "smoke@cautionyourblast.com", }
        }
      },
      where: {
        reference: "SMOKE",
      },
    },
  });
});
