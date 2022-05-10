Feature:
  Dashboard filtering

  Background:
    Given I am logged in as a "SuperAdmin"
    And A lawyers list exists for Eurasia
    And there are these list items
      | contactName | status            | isPublished | isBlocked | isApproved | emailVerified |
      | Winston     | NEW               | false       | false     | false      | true          |
      | O'brien     | NEW               | false       | false     | false      | false         |
      | Julia       | OUT_WITH_PROVIDER | false       | false     | false      | true          |
      | Emmanuel    | EDITED            | false       | false     | false      | true          |
      | Parsons     | PUBLISHED         | true        | false     | false      | true          |
    Given I am viewing list item details for reference:SMOKE

  Scenario: Request edits

    When I view the list item details for
      | Winston |
    Then I see the radio buttons for
      | Publish | Request changes | Remove |
    And not the radio buttons for
      | Unpublish |
