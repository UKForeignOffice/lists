Feature:
    Dashboard sorting

    Background:
        Given I am logged in as a "SuperAdmin"
        And A "lawyers" list exists for Eurasia
        And there are these list items
            | contactName | organisationName | status            | isPublished | isBlocked | isApproved | emailVerified | updatedAt   |
            | Winston     | Winston Law      | NEW               | false       | false     | false      | true          | 2022-01-01  |
            | O'brien     | Brien Law        | NEW               | false       | false     | false      | false         | 2022-01-05  |
            | Julia       | Julia Law        | OUT_WITH_PROVIDER | false       | false     | false      | true          | 2022-01-12  |
            | Joker       | Emmanuel Law     | EDITED            | false       | false     | false      | true          | 2022-02-03  |
            | Parsons     | Parsons Law      | PUBLISHED         | true        | false     | false      | true          | 2022-01-08  |
        Given I am viewing list item index for reference:SMOKE


    Scenario: Show providers based on last updated date first
        Then I should this order
            | contactName | rowPosition |
            | Joker       | 1           |
            | Julia       | 2           |
            | Parsons     | 3           |
            | Winston     | 4           |
