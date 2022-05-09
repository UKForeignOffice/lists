Feature:
  Dashboard filtering

  Background:
    Given I am logged in as a "SuperAdmin"
    And A lawyers list exists for Eurasia
    And there are these list items
      | contactName | status            | isPublished | isBlocked | isApproved | emailVerified |
      | Winston     | NEW               | false       | false     | false      | true          |
      | O'brien     | NEW               | false       | false     | false      | true          |
      | Julia       | NEW               | false       | false     | false      | true          |
    And I am viewing list item index for reference:SMOKE




  Scenario:
    Given "Winston" is unpinned
    When I pin "Winston"
    Then I see the pinned notification message
    And I see "Winston" pinned



