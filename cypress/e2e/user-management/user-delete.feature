Feature: List management deleting users

  Background:
    Given A "lawyers" list exists for Eurasia

  Scenario: A deleted user should not show in the list of users
    When User "smoke+delete+1@cautionyourblast.com" has been added to list with reference:SMOKE
    And I am logged in as a "Administrator"
    And I am viewing the users page
    When I click the edit link for user with email "smoke+delete+1@cautionyourblast.com"
    And I click the "Delete admin" button
    And I should see the heading "Remove access"
    And I click the "Delete admin" button
    Then I see the notification text "smoke+delete+1@cautionyourblast.com has been removed as an admin"
    And I do not see "smoke+delete+1@cautionyourblast.com" on the page

  Scenario: A deleted user should not have access to the list they had before they were deleted
    When User "smoke+delete+2@cautionyourblast.com" has been added to list with reference:SMOKE
    And I am logged in as a "Administrator"
    And I am viewing the users page
    And I click the edit link for user with email "smoke+delete+2@cautionyourblast.com"
    And I click the "Delete admin" button
    And I should see the heading "Remove access"
    And I click the "Delete admin" button
    And I click the link "Sign out"
    Then I am logged in as "smoke+delete+2@cautionyourblast.com"
    And  I visit the "/dashboard" url
    And I do not see "Funeral Directors" on the page
