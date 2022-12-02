Feature: Dashboard filtering

  Background:
    Given I am logged in as a "SuperAdmin"
    And A "lawyers" list exists for Eurasia
    And there are these list items
      | contactName | organisationName | emailAddress               | status            | isPublished | emailVerified | updatedAt |
      | Winston     | Winston Law      | smoke@cautionyourblast.com | NEW               | false       | true          | 01/01/22  |
      | O'brien     | Brien Law        | smoke@cautionyourblast.com | NEW               | false       | false         | 05/01/22  |
      | Julia       | Julia Law        | smoke@cautionyourblast.com | OUT_WITH_PROVIDER | false       | true          | 12/01/22  |
      | Joker       | Emmanuel Law     | smoke@cautionyourblast.com | EDITED            | false       | true          | 03/02/22  |
      | Bruce       | Wayne Lawyers    | smoke@cautionyourblast.com | EDITED            | true        | true          | 04/02/22  |
      | Parsons     | Parsons Law      | smoke@cautionyourblast.com | PUBLISHED         | true        | true          | 08/01/22  |
    Given I am viewing list item index for reference:SMOKE

  Scenario Outline: View list item details
    When I am viewing the list item details for "<contactName>"
    Then I see radio buttons "<radioButtons>"
    And I do not see radio buttons "<radioButtonsConfirm>"
    And The textarea should show if I click the Request changes radio button

    Examples:
      | contactName | radioButtons                               | radioButtonsConfirm                         |
      | Winston     | Publish,Request changes,Remove             | Unpublish,Update live version               |
      | Julia       | Publish,Request changes,Remove             | Unpublish,Update live version               |
      | Bruce       | Update live version,Request changes,Remove | Publish,Unpublish                           |
      | Joker       | Publish,Request changes,Remove             | Update live version,Unpublish               |


#  Scenario Outline: Request changes for list item
#
#    When I am viewing the list item details for "<contactName>"
#    And The textarea should show if I click the Request changes radio button
#    And I enter a message in the textarea
#    And I click the "Continue" button
#    Then I should see the provider details "<contactName>", "<organisationName>" and "smoke@cautionyourblast.com"
#    And I click the "Request changes" button
#    Then I see the notification text "Change request sent to <organisationName>"
#
#    Examples:
#      | contactName | organisationName |
#      | Julia       | Julia Law        |
#      | Winston     | Winston Law      |
#      | Joker       | Emmanuel Law     |
#
#
#  Scenario Outline: Publish list item
#
#    When I am viewing the list item details for "<contactName>"
#    And I click the "Publish" radio button
#    And I click the "Continue" button
#    And I click the "Publish" button
#    Then I see the notification text "<organisationName> has been published"
#
#    Examples:
#      | contactName | organisationName |
#      | Julia       | Julia Law        |
#      | Winston     | Winston Law      |
#
#
#  Scenario Outline: Remove list item
#
#    When I am viewing the list item details for "<contactName>"
#    And I click the "Remove" radio button
#    And I click the "Continue" button
#    Then I should see the provider details "<contactName>", "<organisationName>" and "smoke@cautionyourblast.com"
#    And I click the "Remove" button
#    Then I see the notification text "<organisationName> has been removed"
#
#    Examples:
#      | contactName | organisationName |
#      | Julia       | Julia Law        |
#      | Winston     | Winston Law      |
#      | Joker       | Emmanuel Law     |
#      | Parsons     | Parsons Law      |
#
#
#  Scenario: Confirm and update unpublished list item
#
#    When I am viewing the list item details for "Joker"
#    And I click the "Publish" radio button
#    And I click the "Continue" button
#    And I click the "Publish" button
#    Then I see the notification text "Emmanuel Law has been updated and published"
#
#
#  Scenario: Confirm and update published  list item
#
#    When I am viewing the list item details for "Bruce"
#    And I click the "Update live version" radio button
#    And I click the "Continue" button
#    And I click the "Update" button
#    Then I see the notification text "Wayne Lawyers has been updated and published"
#
#
#  Scenario: Unpublish list item
#
#    When I am viewing the list item details for "Parsons"
#    And I click the "Unpublish" radio button
#    And I click the "Continue" button
#    And I click the "Unpublish" button
#    Then I see the notification text "Parsons Law has been unpublished"
#
#
#  Scenario: Show expected fields on list detail
#    When I am viewing the list item details for "Winston"
#    Then I should see these rows
#      | rowLabel                                      | rowValue                               |
#      | Company                                       | Winston Law                            |
#      | Company size                                  | Independent lawyer / sole practitioner |
#      | Regions                                       | France and UK                          |
#      | Legal expertise                               | Not provided                           |
#      | Legal aid                                     | Yes                                    |
#      | Pro bono                                      | Yes                                    |
#      | Provided services to British nationals before | Yes                                    |
#      | Contact name                                  | Winston                                |
#      | Email address for GOV.UK                      | smoke@cautionyourblast.com             |
#      | Telephone                                     | 1234567                                |
#      | Professional associations                     | Miniluv                                |
#      | Email - private                               | smoke@cautionyourblast.com             |
#

  Scenario: Should not be able to view list if not publisher
    Given I am logged in as a ""
    When I visit a list that I am not a publisher of
    Then I should see an unauthorised page
