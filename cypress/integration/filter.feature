Feature:
  Dashboard filtering

  Background:
    Given I am logged in as a "SuperAdmin"
    And A lawyers list exists for Eurasia
    And there are these list items
      | contactName | status            | isPublished | isBlocked | isApproved |
      | Winston     | NEW               | false       | false     | false      |
      | Julia       | OUT_WITH_PROVIDER | false       | false     | false      |
      | Emmanuel    | EDITED            | false       | false     | false      |
      | O'Brien     | PUBLISHED         | false       | false     | false      |
      | Parsons     | PUBLISHED         | true        | false     | false      |

  Scenario: Filter by to do
    Given I am viewing list item index 1984
    When I filter by
      | To do |
    Then I see the list items
      | Winston | Emmanuel |


  Scenario: Filter by to do, out with provider
    Given I am viewing list item index 1984
    When I filter by
      | To do | Out with provider |
    Then I see the list items
      | Winston | Emmanuel |

  Scenario: Filter by to do, out with provider, published
    Given I am viewing list item index 1984
    When I filter by
      | To do | Out with provider | Published |
    Then I see the list items
      | Winston | Emmanuel |

  Scenario: Filter by to do, published
    Given I am viewing list item index 1984
    When I filter by
      | To do | Published |
    Then I see the list items
      | Winston | Emmanuel |

  Scenario: Filter by out with provider
    Given I am viewing list item index 1984
    When I filter by
      | Out with provider |
    Then I see the list items
      | Winston | Emmanuel |

  Scenario: Filter by out with provider, published
    Given I am viewing list item index 1984
    When I filter by
      | Out with provider | Published |
    Then I see the list items
      | Winston | Emmanuel |


  Scenario: Filter by published
    Given I am viewing list item index 1984
    When I filter by
      | Published |

    Then I see the list items
      | Winston | Emmanuel |



