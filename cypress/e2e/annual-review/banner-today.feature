Feature: Annual review banners

    Background:
        Given I am logged in as a "User"
        And A "lawyers" list exists for Eurasia

    Scenario: Show the start annual review banner
        And eurasia lawyers have annual review in "60" days
        When the batch process has run
        And I am viewing list item index for reference:SMOKE
        Then I do not see a notification banner

    Scenario: Show the email sent banner
        And eurasia lawyers have annual review in "0" days
        When the batch process has run
        And I am viewing list item index for reference:SMOKE
        Then I see the email sent banner
