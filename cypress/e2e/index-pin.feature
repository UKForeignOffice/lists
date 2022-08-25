Feature:
  Dashboard pinning

  Background:
    Given I am logged in as a "SuperAdmin"
    And A "lawyers" list exists for Eurasia
    And there are these list items
      | contactName | status            | isPublished | isBlocked | isApproved | emailVerified | isPinned |
      | Winston     | NEW               | false       | false     | false      | true          | false    |
      | O'brien     | NEW               | false       | false     | false      | true          | false    |
      | Julia       | NEW               | false       | false     | false      | true          | true     |


    Scenario: Pinning an application
      Given I am viewing list item index for reference:SMOKE
      When I pin "Winston"
      Then I see the notification that "Winston" has been "pinned"

    Scenario: Unpinning an application
      Given I am viewing list item index for reference:SMOKE
      When I unpin "Julia"
      Then I see the notification that "Julia" has been "unpinned"
