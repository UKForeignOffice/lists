Feature: List management role changing for super Admins
    Background:
        Given I am logged in as a "SuperAdmin"
        And the following users exist
            | email                             | roles        |
            | list.creator@cautionyourblast.com | ListsCreator |
            | super.admin@cautionyourblast.com  | SuperAdmin   |
            | no.role@cautionyourblast.com      |              |
        Given I am viewing the users page


    Scenario: Make a role-less user a SuperAdmin
        When I click the edit link for user with email "no.role@cautionyourblast.com"
        And check the "Super Admin" checkbox
        And I click the "Save" button
        And go back to the users page
        Then I should see the "SuperAdmin" role assigned to "no.role@cautionyourblast.com"

    Scenario: Remove SuperAdmin role from another SuperAdmin
#        When I click the edit link for user with email "super.admin@cautionyourblast.com"
        When I navigate to "/dashboard/users/super.admin@cautionyourblast.com"
        Then I see "Not allowed to edit super admin account"
