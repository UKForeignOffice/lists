import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I download a file by clicking the link {string}", (name) => {
  const exportLink = cy.findAllByRole("link", {
    name,
  });

  exportLink.invoke("attr", "download", "true");
  exportLink.click();
});
