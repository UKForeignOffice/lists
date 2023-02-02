Feature: List management change annual review date

  Background:
    Given I am logged in as a "Administrator"
    And A "lawyers" list exists for Eurasia
    And I click the link "Lists"
    And I click the link "Settings" for "Eurasia"
    And I click the link "Change"
    And I see page with heading "Change annual review start date"

  Scenario: Can change annual review date
    Given I enter "1" in the "day" input
    And I enter "2" in the "month" input
    And I click the "Continue" button
    And I see page with heading "Confirm new annual review start date"
    And I click the "Continue" button
    Then I see the notification text "Annual review date updated successfully"

  Scenario: User cannot enter date Febuary 29
    Given I enter "29" in the "day" input
    And I enter "2" in the "month" input
    And I click the "Continue" button
    Then I should see the error "You cannot set the annual review to this date. Please choose another"
