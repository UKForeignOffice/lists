Feature: List management role changing for super Admins
    Background:
        Given I am logged in as a "Administrator"
        And the following users exist
            | email                             | roles        |
            | list.creator@cautionyourblast.com | ListsCreator |
            | super.admin@cautionyourblast.com  | Administrator   |
            | no.role@cautionyourblast.com      |              |
        Given I am viewing the users page


    Scenario: Make a role-less user a Administrator
      When I click the edit link for user with email "no.role@cautionyourblast.com"
      And check the "Administrator" checkbox
      And I click the "Save" button
      And go back to the users page
      Then I should see the "Administrator" role assigned to "no.role@cautionyourblast.com"

    Scenario: Remove Administrator role from another Administrator
      When I navigate to "/dashboard/users/super.admin@cautionyourblast.com"
      And uncheck the "Administrator" checkbox
      And I click the "Save" button
      Then I see "Not allowed to edit super admin account"
