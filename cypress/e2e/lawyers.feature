Feature:

  I want to search for lawyers

  Background:
    Given A lawyers list exists for Eurasia
    And there are these list items
      | contactName | status            | isPublished | isBlocked | isApproved | emailVerified | city   | areasOfLaw    |
      | Parsons     | PUBLISHED         | true        | false     | false      | true          | Zurich | Maritime      |
      | Emmanuel    | PUBLISHED         | true        | false     | false      | true          | Geneva | International |
      | Julia       | PUBLISHED         | true        | false     | false      | true          | Basel  | Maritime      |

  Scenario Outline:
    Given I am searching for "<profession>" in "<country>" in "<city>"
    When I select <filters>
    And I continue
    And I have read the disclaimer
    Then I see "<found>"

    Examples:
      | profession | country       | city  | filters                  | found  |
      | lawyers    | Switzerland   | Basel | [Maritime,International] | Julia  |
      | lawyers    | Switzerland   | Basel | [Maritime,International] | Julia  |

