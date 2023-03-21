Feature: Check correct list items are chosen for annual review

    Background: Setup list and provider
        Given A "lawyers" list exists for Eurasia

    Scenario: Provider is not selected if within 28 days of annual review
        When eurasia lawyers have annual review in "31" days
        And list items were added "1" months ago
        And the batch process has run
        Then there are no eligible list items

    Scenario: Provider is not selected if within 28 days of annual review
        When eurasia lawyers have annual review in "27" days
        And list items were added "1" months ago
        And the batch process has run
        Then there are "1" eligible list items
