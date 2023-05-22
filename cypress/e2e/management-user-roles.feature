Feature: List management actions for lists creators

    Background:
      Given the following users exist
      | email                            | roles         |
      | super.admin@cautionyourblast.com | Administrator |
      | no.role@cautionyourblast.com     | user          |

    Scenario: user should not be able to view links to Users page
      Given I am logged in as a "user"
      Then I should not be able to see the "Users" link

    Scenario: user should not be able access Users page by changing urls
      Given I am logged in as a "user"
      When I visit the "/dashboard/users" url
        Then I should be denied permission

    Scenario: super user should be able to access
      Given I am logged in as a "Administrator"
      When I visit the "/dashboard/users" url
      Then I should see the table "List administrators"
