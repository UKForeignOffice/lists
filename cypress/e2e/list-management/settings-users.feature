Feature: List management users

  Background:
    Given I am logged in as a "SuperAdmin"
    And I click the link "Lists"
    And I click the link "Settings" for "Eurasia"


  Scenario Outline: Add emails to list of users
    Given I enter "<emailAddress>" in the email input
    Then I should see "<emailAddress>"

    Examples:
      | emailAddress                 |
      | julia@cautionyourblast.com   |
      | winston@cautionyourblast.com |
      | joker@cautionyourblast.com   |


  Scenario Outline: Remove email from list of users
    Given I remove the user "<emailAddress>"
    And I see page with heading "Confirm the removal of this user"
    And I click the "Remove" button
    Then I should not see "<emailAddress>"

    Examples:
      | emailAddress                 |
      | julia@cautionyourblast.com   |
      | winston@cautionyourblast.com |
      | joker@cautionyourblast.com   |


  Scenario: User cannot delete themselves
    Given I remove the user "smoke@cautionyourblast.com"
    And I see page with heading "Confirm the removal of this user"
    And I click the "Remove" button
    Then I should see the error "You cannot remove your own email address from a list"


  Scenario: Prevent adding duplicate user
    Given I enter "smoke@cautionyourblast.com" in the email input
    Then I should see the error "This user already exists"
