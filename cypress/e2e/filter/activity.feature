Feature:
  Dashboard filtering

  Background:
    Given I am logged in as a "Administrator"
    And A "lawyers" list exists for Eurasia
    And there are these list items
      | contactName | status                | isPublished | isAnnualReview | emailVerified | isArchived | isUnpublishedByUser |
      | Winston     | NEW                   | false       |                | true          |            |                     |
      | O'brien     | NEW                   | false       |                | false         |            |                     |
      | Julia       | OUT_WITH_PROVIDER     | false       |                | true          |            |                     |
      | Emmanuel    | EDITED                | false       |                | true          |            |                     |
      | Parsons     | PUBLISHED             | true        |                | true          |            |                     |
      | Boxer       | UNPUBLISHED           | false       |                | true          | true       |                     |
      | Benjamin    | UNPUBLISHED           | false       |                | true          |            | true                |
      | Jones       | CHECK_ANNUAL_REVIEW   | true        | true           | true          |            |                     |
      | Napoleon    | ANNUAL_REVIEW_OVERDUE | false       | true           | true          |            |                     |
    Given I am viewing list item index for reference:SMOKE

  Scenario: Filter by to do
    Given I am viewing list item index for reference:SMOKE
    When I filter by
      | To do |
    Then I see the list items
      | Winston | Emmanuel | Jones | Benjamin |
    And not the list items
      | Julia | O'Brien | Parsons | Napoleon | Boxer |

  Scenario: Filter by out with provider
    Given I am viewing list item index for reference:SMOKE
    When I filter by
      | With provider |
    Then I see the list items
      | Julia | Napoleon |
    And not the list items
      | Winston | Emmanuel | Boxer | Jones |

  Scenario: Filter by No action needed
    Given I am viewing list item index for reference:SMOKE
    When I filter by
      | No action needed |
    Then I see the list items
      | Parsons |
    And not the list items
      | Julia | O'Brien | Napoleon | Winston | Emmanuel | Boxer | Jones |

  Scenario: Filter by to do, with provider
    Given I am viewing list item index for reference:SMOKE
    When I filter by
      | To do | With provider |
    Then I see the list items
      | Julia | Napoleon | Winston | Emmanuel  | Jones | Benjamin |
    And not the list items
      | Parsons | O'brien |

  Scenario: Filter by to do, no action needed
    Given I am viewing list item index for reference:SMOKE
    When I filter by
      | To do | No action needed |
    Then I see the list items
      | Winston | Emmanuel | Jones | Parsons | Benjamin |
    And not the list items
      | Julia | O'Brien | Boxer |

