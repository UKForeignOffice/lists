Feature:
    Dashboard sorting

    Background:
        Given I am logged in as a "SuperAdmin"
        And A "lawyers" list exists for Eurasia
        And there are these list items
            | contactName | organisationName | status            | isPublished | isBlocked | isApproved | emailVerified | updatedAt |
            | Winston     | Winston Law      | NEW               | false       | false     | false      | true          | 01/01/22  |
            | O'brien     | Brien Law        | NEW               | false       | false     | false      | false         | 05/01/22  |
            | Julia       | Julia Law        | OUT_WITH_PROVIDER | false       | false     | false      | true          | 12/01/22  |
            | Joker       | Emmanuel Law     | EDITED            | false       | false     | false      | true          | 03/02/22  |
            | Parsons     | Parsons Law      | PUBLISHED         | true        | false     | false      | true          | 08/01/22  |
        Given I am viewing list item index for reference:SMOKE


    Scenario: Show providers based on oldest date first
        Then I should this order
            | contactName | rowPosition |
            | Winston     | 1           |
            | Julia       | 2           |
            | Joker       | 3           |
            | Parsons     | 4           |
