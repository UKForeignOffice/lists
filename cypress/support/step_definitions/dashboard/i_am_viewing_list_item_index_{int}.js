Given("I am viewing list item index {int}", (id) => {
  cy.visit(`$http://localhost:3000/dashboard/lists/${id}/items`);
});
