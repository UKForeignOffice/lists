Then("the country search redirects to {string}", (url) => {
  cy.wait("@countrySearch")
    .its("response")
    .then(({ statusCode, headers }) => {
      expect(statusCode).to.eq(302);
      expect(headers.location).to.eq(url);
    });
});
