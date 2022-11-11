Feature:
  Dashboard filtering

  Background:
    Given I am logged in as a "SuperAdmin"
    And A "lawyers" list exists for Eurasia
    And there are these list items
      | contactName | status                | isPublished | isAnnualReview | emailVerified | isArchived |
      | Winston     | NEW                   | false       |                | true          |          |
      | O'brien     | NEW                   | false       |                | false         |          |
      | Julia       | OUT_WITH_PROVIDER     | false       |                | true          |          |
      | Emmanuel    | EDITED                | false       |                | true          |          |
      | Parsons     | PUBLISHED             | true        |                | true          |          |
      | Boxer       | UNPUBLISHED           | false       |                | true          | true     |
      | Boxer       | UNPUBLISHED           | false       |                | true          | true     |
      | Jones       | CHECK_ANNUAL_REVIEW   | true        | true           | true          |          |
      | Napoleon    | ANNUAL_REVIEW_OVERDUE | false       | true           | true          |          |
    Given I am viewing list item index for reference:SMOKE

  Scenario: Filter by New publishing status
    Given I am viewing list item index for reference:SMOKE
    When I filter by
      | New |
    Then I see the list items
      | Winston | Emmanuel | Julia | Emmanuel |
    And not the list items
      | Winston | Emmanuel | Julia | O'Brien | Boxer | Napoleon |

  Scenario: Filter by Live status
    Given I am viewing list item index for reference:SMOKE
    When I filter by
      | Live |
    Then I see the list items
      | Parsons | Jones |
    And not the list items
      | Winston | Emmanuel | Julia | O'Brien | Boxer | Napoleon |

  Scenario: Filter by Unpublished status
    Given I am viewing list item index for reference:SMOKE
    When I filter by
      | Unpublished |
    Then I see the list items
      | Napoleon |
    And not the list items
      | Winston | Emmanuel | Jones | Julia | O'Brien | Parsons | Boxer |

  Scenario: Filter by Archived status
    Given I am viewing list item index for reference:SMOKE
    When I filter by
      | Archived |
    Then I see the list items
      | Boxer |
    And not the list items
      | Winston | Emmanuel | Jones | Julia | O'Brien | Parsons | Napoleon |

