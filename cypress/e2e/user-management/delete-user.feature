Feature: List management deleting users

  Background:
    Given the following users exist
      | email                               | roles         |
      | smoke+delete+1@cautionyourblast.com |               |
      | smoke+delete+2@cautionyourblast.com |               |
      | super.admin@cautionyourblast.com    | Administrator |
    And the following user has been added to a list "smoke+delete+2@cautionyourblast.com"

    Scenario: A deleted user should not show in the list of users
      And I am logged in as a "Administrator"
      And I am viewing the users page
      When I click the edit link for user with email "smoke+delete+1@cautionyourblast.com"
      And I click the "Delete admin" button
      And I should see the heading "Remove access"
      And I click the "Delete admin" button
      Then I see the notification text "smoke+delete+1@cautionyourblast.com has been removed as an admin"
      And I do not see "smoke+delete+1@cautionyourblast.com" on the page

    Scenario: A deleted user should not have access to the list they had before they were deleted
      And I am logged in as "smoke+delete+2@cautionyourblast.com"
      And I click the "Continue" button
      And  I visit the "/dashboard" url
      And I see "Funeral Directors"
      And I click the link "Sign out"
      When I am logged in as a "Administrator"
      And I am viewing the users page
      And I click the edit link for user with email "smoke+delete+2@cautionyourblast.com"
      And I click the "Delete admin" button
      And I should see the heading "Remove access"
      And I click the "Delete admin" button
      And I click the link "Sign out"
      Then I am logged in as "smoke+delete+2@cautionyourblast.com"
      And I click the "Continue" button
      And  I visit the "/dashboard" url
      And I do not see "Funeral Directors" on the page
