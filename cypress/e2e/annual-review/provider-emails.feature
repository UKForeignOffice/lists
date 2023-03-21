Feature: Check correct email is sent to provider that has had edits requested


    Background: Setup list and provider
        Given A "lawyers" list exists for Eurasia

    Scenario Outline: Provider is sent a differnt unpublish email based on weeks since annual review
        When eurasia lawyers have annual review in "-<daysSinceAnnualReview>" days
        And list items were added "3" months ago
        And the batch process has run
        And the worker process has run
        Then the reminder email for "<reminderWeek>" weeks is sent to eligible providers

        Examples:
            | daysSinceAnnualReview | reminderWeek |
            | 8                     | 1            |
            | 15                    | 2            |
            | 22                    | 3            |
            | 29                    | 4            |
            | 36                    | 5            |