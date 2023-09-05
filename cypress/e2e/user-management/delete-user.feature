Feature: List management deleting users

  Background:
    Given the following users exist
      | email                               | roles         |
      | smoke+delete+1@cautionyourblast.com |               |
      | smoke+delete+2@cautionyourblast.com |               |
      | super.admin@cautionyourblast.com    | Administrator |
    And the following user has been added to a list "smoke+delete+2@cautionyourblast.com"

    Scenario: A deleted user should not show in the list of users
      Given I am logged in as a "Administrator"
      And I am viewing the users page
      When I click the edit link for user with email "smoke+delete+1@cautionyourblast.com"
      And I click the "Delete admin" button
      And I should see the heading "Remove access"
      And I click the "Delete admin" button
      Then I should see the heading "List administrators"
      And I do not see "smoke+delete+1@cautionyourblast.com" on the page


    # Write test to check happy path of deleting

    # Write test to login as user with a list added to them
    # Check the list is displaying
    # Login as admin and delete that list
    # Then log back in as that user and the list should not be there
