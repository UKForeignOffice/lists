Then("there are no eligible list items", async () => {
    cy.task("db", {
      operation: "list.findFirst",
      variables: {
        where: {
          reference: "SMOKE",
        },
      },
    }).then((list) => {
        cy.log(list.jsonData)
      cy.expect(list.jsonData).to.not.have.property('currentAnnualReview');
    });
  });
