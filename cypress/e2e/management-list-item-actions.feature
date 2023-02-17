Feature: Dashboard filtering

  Background:
    Given I am logged in as a "Administrator"
    And A "lawyers" list exists for Eurasia
    And there are these list items
      | contactName | organisationName | emailAddress               | status              | isPublished | isAnnualReview | emailVerified | updatedAt |
      | Winston     | Winston Law      | smoke@cautionyourblast.com | NEW                 | false       | false          | true          | 01/01/22  |
      | O'brien     | Brien Law        | smoke@cautionyourblast.com | NEW                 | false       | false          | false         | 05/01/22  |
      | Julia       | Julia Law        | smoke@cautionyourblast.com | OUT_WITH_PROVIDER   | false       | false          | true          | 12/01/22  |
      | Samson      | Samson Law       | smoke@cautionyourblast.com | OUT_WITH_PROVIDER   | true        | false          | true          | 07/01/22  |
      | Joker       | Emmanuel Law     | smoke@cautionyourblast.com | EDITED              | false       | false          | true          | 03/02/22  |
      | Bruce       | Wayne Lawyers    | smoke@cautionyourblast.com | EDITED              | true        | true           | true          | 04/02/22  |
      | Parsons     | Parsons Law      | smoke@cautionyourblast.com | PUBLISHED           | true        | true           | true          | 08/01/22  |
      | Newman      | Newman Law       | smoke@cautionyourblast.com | CHECK_ANNUAL_REVIEW | false       | false          | true          | 10/01/22  |
      | Tessa       | Tessa Law        | smoke@cautionyourblast.com | OUT_WITH_PROVIDER   | false       | true           | true          | 11/01/22  |
      | Kaleb       | Kaleb Law        | smoke@cautionyourblast.com | OUT_WITH_PROVIDER   | true        | true           | true          | 06/01/22  |
      | Seth        | Seth Law         | smoke@cautionyourblast.com | CHECK_ANNUAL_REVIEW | true        | false          | true          | 09/01/22  |
    Given I am viewing list item index for reference:SMOKE

  Scenario Outline: View list item details

    When I am viewing the list item details for "<contactName>"
    Then I see radio buttons "<radioButtons>"
    And I do not see radio buttons "<radioButtonsConfirm>"

    Examples:
      | contactName | radioButtons                        | radioButtonsConfirm        |
      | Winston     | Publish,Request changes,Archive     | Remove,Update live version |
      | Julia       | Publish,Archive                     | Remove,Update live version |
      | Bruce       | Update live version,Request changes | Publish,Remove             |
      | Joker       | Publish,Request changes,Archive     | Update live version,Remove |


  Scenario: Request changes radio button reveals a textarea
    When I am viewing the list item details for "Winston"
    And I select "Request changes"
    And I see the input "Change message"


  Scenario: Show only Unpublish when listItem has isPublished or isAnnualReview flag set
    When I am viewing the list item details for "Kaleb"
    Then I see radio buttons "Unpublish"
    And I do not see radio buttons "Publish,Request changes,Remove,Update live version"


  Scenario Outline: Request changes for list item

    When I am viewing the list item details for "<contactName>"
    And I select "Request changes"
    And I enter a message in the textarea
    And I click the "Continue" button
    Then I should see the provider details "<contactName>", "<organisationName>" and "smoke@cautionyourblast.com"
    And I click the "Request changes" button
    Then I see the notification text "Change request sent to <organisationName>"

    Examples:
      | contactName | organisationName |
      | Winston     | Winston Law      |
      | Joker       | Emmanuel Law     |


  Scenario Outline: Publish list item

    When I am viewing the list item details for "<contactName>"
    And I click the "Publish" radio button
    And I click the "Continue" button
    And I click the "Publish" button
    Then I see the notification text "<organisationName> has been published"

    Examples:
      | contactName | organisationName |
      | Julia       | Julia Law        |
      | Winston     | Winston Law      |


  Scenario Outline: Remove non-live list items

    When I am viewing the list item details for "<contactName>"
    And I click the "Archive" radio button
    And I click the "Continue" button
    Then I should see the heading "Archive <organisationName>"
    And I click the "Archive" button
    Then I see the notification text "<organisationName> has been archived"

    Examples:
      | contactName | organisationName |
      | Julia       | Julia Law        |
      | Winston     | Winston Law      |

  Scenario Outline: Remove live list items

    When I am viewing the list item details for "<contactName>"
    And I click the "Unpublish" radio button
    And I click the "Continue" button
    Then I should see the heading "Unpublish <organisationName>"
    And I click the "Unpublish" button
    Then I see the notification text "<organisationName> has been unpublished"

    Examples:
      | contactName | organisationName |
      | Parsons     | Parsons Law      |


  Scenario: Confirm and update unpublished list item

    When I am viewing the list item details for "Joker"
    And I click the "Publish" radio button
    And I click the "Continue" button
    And I click the "Publish" button
    Then I see the notification text "Emmanuel Law has been updated and published"


  Scenario: Confirm and update published  list item

    When I am viewing the list item details for "Bruce"
    And I click the "Update live version" radio button
    And I click the "Continue" button
    And I click the "Update" button
    Then I see the notification text "Wayne Lawyers has been updated and published"


  Scenario: Unpublish list item

    When I am viewing the list item details for "Parsons"
    And I click the "Unpublish" radio button
    And I click the "Continue" button
    And I click the "Unpublish" button
    Then I see the notification text "Parsons Law has been unpublished"


  Scenario: Show expected fields on list detail
    When I am viewing the list item details for "Winston"
    Then I should see these rows
      | rowLabel                                      | rowValue                               |
      | Company                                       | Winston Law                            |
      | Company size                                  | Independent lawyer / sole practitioner |
      | Regions                                       | France and UK                          |
      | Legal expertise                               | Not provided                           |
      | Legal aid                                     | Yes                                    |
      | Pro bono                                      | Yes                                    |
      | Provided services to British nationals before | Yes                                    |
      | Contact name                                  | Winston                                |
      | Email address for GOV.UK                      | smoke@cautionyourblast.com             |
      | Telephone                                     | 1234567                                |
      | Professional associations                     | Miniluv                                |
      | Email - private                               | smoke@cautionyourblast.com             |

  Scenario: Should not be able to view list if not publisher
    Given I am logged in as a ""
    When I visit a list that I am not a publisher of
    Then I should see an unauthorised page

  Scenario: Archive list item
    When I am viewing the list item details for "Julia"
    And I click the "Archive" radio button
    And I click the "Continue" button
    And I see page with heading "Archive Julia Law"
    And I click the "Archive" button
    Then I see the notification text "Julia Law has been archived"
    And I do not see "Julia" on the page


  Scenario: Should see updated notification at the top of the page for CHECK_ANNUAL_REVIEW
    When I am viewing the list item details for "Newman"
    Then I see the notification text "This service provider has confirmed their details are up to date"


  Scenario: Should see UPDATED tags on updated fields
    When Some fields have been updated for "Newman"
    And I am viewing the list item details for "Newman"
    Then I see the notification text "This service provider has updated their details"
    And I "see" the updated tag on row "Pro bono"
    And I "see" the updated tag on row "Company"
    And I "do not see" the updated tag on row "Legal aid"

