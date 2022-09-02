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
        And click on the save button
        And go back to the users page
        Then I should see the "SuperAdmin" role assiged to "no.role@cautionyourblast.com"


    Scenario: Change ListsCreator to SuperAdmin
        When I click the edit link for user with email "list.creator@cautionyourblast.com"
        And uncheck the "Lists Creator" checkbox
        And check the "Super Admin" checkbox
        And click on the save button
        And go back to the users page
        Then I should see the "SuperAdmin" role assiged to "list.creator@cautionyourblast.com"


    Scenario: Remove SuperAdmin role from another SuperAdmin
        When I click the edit link for user with email "super.admin@cautionyourblast.com"
        And uncheck the "Super Admin" checkbox
        And click on the save button
        And go back to the users page
        Then I should see nothing assiged to "super.admin@cautionyourblast.com"
