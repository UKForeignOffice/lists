Feature: List management actions for lists creators

    Background:
        Given I am logged in as a "ListsCreator"
        And the following users exist
            | email                             | roles        |
            | list.creator@cautionyourblast.com | ListsCreator |
            | super.admin@cautionyourblast.com  | SuperAdmin   |
            | no.role@cautionyourblast.com      |              |

    Scenario: ListCreator should not be able to view links to Users page
        When I visit the "/dashboard" url
        Then I should not be able to see the "Users" link

    Scenario: ListCreator should not be able access Users page by changing urls
        When I visit the "/dashboard/users" url
        Then I should be denied permission
