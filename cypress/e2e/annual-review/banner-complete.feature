Feature: Annual review complete banner

  Background:
    Given I am logged in as a "Admin"
    And A "lawyers" list exists for Eurasia

  Scenario: Annual review complete banner is displayed
    And eurasia lawyers finished annual review and "all" providers responded
    Then I should see the complete banner with the "all" responded text

  Scenario: Text is displayed if providers is unpublished
    And eurasia lawyers finished annual review and "some" providers responded
    Then I should see the complete banner with the "some" responded text

  Scenario: Text is displayed if providers is unpublished
    And eurasia lawyers finished annual review and "no" providers responded
    Then I should see the complete banner with the "no" responded text
