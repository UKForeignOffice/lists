Feature: List management change annual review date

  Background:
    Given I am logged in as a "Administrator"
    And A "lawyers" list exists for Eurasia
    And I click the link "Lists"
    And I click the link "Settings" in the row with header "Lawyers in Eurasia"
    And I click the link "Change date"
    And I see page with heading "Change annual review start date"

  Scenario: Can change annual review date
    When I enter a valid new annual review date
    And I click the "Continue" button
    And I see page with heading "Confirm new annual review start date"
    And I click the "Continue" button
    Then I see the notification text "Annual review date updated successfully"

  Scenario: User cannot enter date February 29
    Given I enter "29" for "Day"
    And I enter "2" for "Month"
    And I click the "Continue" button
    Then I should see the error "You cannot set the annual review to this date. Please choose another"
