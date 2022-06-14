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
    Given I am viewing list item index for reference:SMOKE

  Scenario: Filter by to do

    When I filter by
      | To do |
    Then I see the list items
      | Winston | Emmanuel |
    And not the list items
      | Julia | O'Brien | Parsons |


  Scenario: Filter by to do, out with provider

    When I filter by
      | To do | Out with provider |
    Then I see the list items
      | Winston | Emmanuel | Julia |
    And not the list items
      | Parsons | O'brien |

  Scenario: Filter by to do, out with provider, published
  Given I am viewing list item index for reference:SMOKE

    When I filter by
      | To do | Out with provider | Published |
    Then I see the list items
      | Winston | Emmanuel | Julia  | Parsons |
    And not the list items
      | O'brien |

  Scenario: Filter by to do, published
  Given I am viewing list item index for reference:SMOKE

    When I filter by
      | To do | Published |
    Then I see the list items
      | Winston | Emmanuel | Parsons |
    And not the list items
      | Julia | O'brien |

  Scenario: Filter by out with provider
  Given I am viewing list item index for reference:SMOKE

    When I filter by
      | Out with provider |
    Then I see the list items
      | Julia |
    And not the list items
      | Winston | Emmanuel | O'Brien | Parsons |


#      | Winston | Emmanuel | Julia | O'Brien | Parsons |
  Scenario: Filter by out with provider, published
  Given I am viewing list item index for reference:SMOKE

    When I filter by
      | Out with provider | Published |
    Then I see the list items
      | Julia | Parsons |
    And not the list items
      | Winston | Emmanuel | O'Brien |


  Scenario: Filter by published
  Given I am viewing list item index for reference:SMOKE

    When I filter by
      | Published |
    Then I see the list items
      | Parsons |
    And not the list items
      | Winston | Emmanuel | Julia | O'Brien |




