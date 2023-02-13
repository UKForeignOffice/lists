Feature: Eligible list items are calculated correctly


  Background:
    Given I am logged in as a "Administrator"
    And A "lawyers" list exists for Eurasia
    And eurasia lawyers are due to begin annual review
    And the batch process has run
    And I am viewing list item index for reference:SMOKE

  Scenario:
    Then eligible list items are correct
