Feature: List management users

  Background:
    Given I am logged in as a "user"
    And A "lawyers" list exists for Eurasia
    And a list exists with users
    And I click the link "Lists"
    And I click the link "Settings" in the row with header "Lawyers in Eurasia"

  Scenario: Add emails to list of users
    When I add "julia@cautionyourblast.com" as a user
    Then I should see "julia@cautionyourblast.com"

  Scenario: Remove emails from list of users
    When I add "smoke+1@cautionyourblast.com" as a user
    When I remove the user "smoke+1@cautionyourblast.com"
    And I click the "Remove" button
    Then I should not see "smoke+1@cautionyourblast.com"

  Scenario: User cannot delete themselves
    Given I remove the user "smoke@cautionyourblast.com"
    And I see page with heading "Confirm the removal of this user"
    And I click the "Remove" button
    Then I should see the error "You cannot remove yourself as a user. Contact an administrator to remove your email address from this list."

  Scenario: Prevent adding duplicate user
    When I add "smoke@cautionyourblast.com" as a user
    Then I should see the error "This user already exists"
