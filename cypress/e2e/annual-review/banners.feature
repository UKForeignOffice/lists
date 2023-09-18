Feature: Annual review banners

  Background:
    Given I am logged in as a "User"
    And A "lawyers" list exists for Eurasia
    And eurasia lawyers are due to begin annual review

    Scenario:
      When the batch process has run
      And I am viewing list item index for reference:SMOKE
      Then I see the start banner

    Scenario:
      When a list item has been with the provider for 100 days with the reference "UNPUBLISH_DAY_TEST"
      And 1 days before unpublish
      And the batch process has run
      And the worker process has run
      And I am viewing list item index for reference:SMOKE
      Then I see "1 service provider is going to be unpublished"


