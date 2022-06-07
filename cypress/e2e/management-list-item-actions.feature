Feature:
  Dashboard filtering

  Background:
    Given I am logged in as a "SuperAdmin"
    And A lawyers list exists for Eurasia
    And there are these list items
      | contactName | organisationName  | emailAddress             | status            | isPublished | isBlocked | isApproved | emailVerified | displayedRadioButtons                     | hiddenRadioButtons                         |
      | Winston     | Winston Law       | ali@cautionyourblast.com | NEW               | false       | false     | false      | true          | Publish,Request changes,Remove            | Unpublish,Confirm and update               |
      | O'brien     | Brien Law         | ali@cautionyourblast.com | NEW               | false       | false     | false      | false         | Publish,Request changes,Remove            | Unpublish,Confirm and update               |
      | Julia       | Julia Law         | ali@cautionyourblast.com | OUT_WITH_PROVIDER | false       | false     | false      | true          | Publish,Request changes,Remove            | Unpublish,Confirm and update               |
      | Emmanuel    | Emmanuel Law      | ali@cautionyourblast.com | EDITED            | false       | false     | false      | true          | Request changes,Confirm and update,Remove | Publish,Unpublish                          |
      | Parsons     | Parsons Law       | ali@cautionyourblast.com | PUBLISHED         | true        | false     | false      | true          | Unpublish, Remove                         | Publish,Request changes,Confirm and update |
    Given I am viewing list item index for reference:SMOKE

  # NEW
  Scenario: list item details for NEW status

    When I am viewing the list item details for "Winston"
    Then I see radio buttons
      | Publish | Request changes | Remove |
    And I do not see radio buttons
      | Unpublish | Confirm and update |
    And The textarea should show if I click the Request changes radio button

  Scenario: Request changes for list item in NEW status

    When I am viewing the list item details for "Winston"
    And The textarea should show if I click the Request changes radio button
    And I enter a message in the textarea
    And I click the "Continue" button
    Then I should see the provider details "Winston", "Winston Law" and "ali@cautionyourblast.com"
    And I click the "Request changes" button
    Then I see the notification text "Change request sent to Winston Law"

  Scenario: Publish list item in NEW status

    When I am viewing the list item details for "Winston"
    And I click the "Publish" radio button
    And I click the "Continue" button
    And I click the "Publish" button
    Then I see the notification text "Winston Law has been published"

  Scenario: Remove list item in NEW status

    When I am viewing the list item details for "Winston"
    And I click the "Remove" radio button
    And I click the "Continue" button
    Then I should see the provider details "Winston", "Winston Law" and "ali@cautionyourblast.com"
    And I click the "Remove" button
    Then I see the notification text "Winston Law has been removed"


  # OUT_WITH_PROVIDER
  Scenario: list item details for OUT_WITH_PROVIDER status

    When I am viewing the list item details for "Julia"
    Then I see radio buttons
      | Publish | Request changes | Remove |
    And I do not see radio buttons
      | Unpublish | Confirm and update |
    And The textarea should show if I click the Request changes radio button

  Scenario: Request changes for list item in OUT_WITH_PROVIDER status

    When I am viewing the list item details for "Julia"
    And The textarea should show if I click the Request changes radio button
    And I enter a message in the textarea
    And I click the "Continue" button
    Then I should see the provider details "Julia", "Julia Law" and "ali@cautionyourblast.com"
    And I click the "Request changes" button
    Then I see the notification text "Change request sent to Julia Law"

  Scenario: Publish list item in OUT_WITH_PROVIDER status

    When I am viewing the list item details for "Julia"
    And I click the "Publish" radio button
    And I click the "Continue" button
    And I click the "Publish" button
    Then I see the notification text "Julia Law has been published"

  Scenario: Remove list item in OUT_WITH_PROVIDER status

    When I am viewing the list item details for "Julia"
    And I click the "Remove" radio button
    And I click the "Continue" button
    Then I should see the provider details "Julia", "Julia Law" and "ali@cautionyourblast.com"
    And I click the "Remove" button
    Then I see the notification text "Julia Law has been removed"


  # EDITED
  Scenario: list item details for EDITED status

    When I am viewing the list item details for "Emmanuel"
    Then I see radio buttons
      | Request changes | Confirm and update | Remove |
    And I do not see radio buttons
      | Publish | Unpublish |
    And The textarea should show if I click the Request changes radio button

  @wip
  Scenario: Request changes for list item in EDITED status

    When I am viewing the list item details for "Emmanuel"
    And The textarea should show if I click the Request changes radio button
    And I enter a message in the textarea
    And I click the "Continue" button
    Then I should see the provider details "Emmanuel", "Emmanuel Law" and "ali@cautionyourblast.com"
    And I click the "Request changes" button
    Then I see the notification text "Change request sent to Emmanuel Law"

  Scenario: Confirm and update list item in EDITED status

    When I am viewing the list item details for "Emmanuel"
    And I click the "Confirm and update" radio button
    And I click the "Continue" button
    And I click the "Update" button
    Then I see the notification text "Emmanuel Law has been updated and published"

  Scenario: Remove list item in EDITED status

    When I am viewing the list item details for "Emmanuel"
    And I click the "Remove" radio button
    And I click the "Continue" button
    Then I should see the provider details "Emmanuel", "Emmanuel Law" and "ali@cautionyourblast.com"
    And I click the "Remove" button
    Then I see the notification text "Emmanuel Law has been removed"


  # PUBLISHED
  Scenario: list item details for PUBLISHED status

    When I am viewing the list item details for "Parsons"
    Then I see radio buttons
      | Unpublish | Remove |
    And I do not see radio buttons
      | Publish | Request changes | Confirm and update |

  Scenario: Unpublish list item in PUBLISHED status

    When I am viewing the list item details for "Parsons"
    And I click the "Unpublish" radio button
    And I click the "Continue" button
    And I click the "Unpublish" button
    Then I see the notification text "Parsons Law has been unpublished"

  Scenario: Remove list item in PUBLISHED status

    When I am viewing the list item details for "Parsons"
    And I click the "Remove" radio button
    And I click the "Continue" button
    Then I should see the provider details "Parsons", "Parsons Law" and "ali@cautionyourblast.com"
    And I click the "Remove" button
    Then I see the notification text "Parsons Law has been removed"
