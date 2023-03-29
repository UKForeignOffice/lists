And("I choose the country {string}", (country) => {
    cy.findByRole("combobox").type(country);
});
