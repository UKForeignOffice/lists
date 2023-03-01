Feature: Annual review banners

  Background:
    Given I am logged in as a "User"
    And A "lawyers" list exists for Eurasia
    And eurasia lawyers have annual review today
    When the batch process has run
    And I am viewing list item index for reference:SMOKE

    Scenario:
      Then I see the email sent banner
