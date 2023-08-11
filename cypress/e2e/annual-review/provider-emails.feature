Feature: Recurring reminder emails (weeklyUnpublish) are sent

    Background: Setup list and provider
      Given A "lawyers" list exists for Eurasia
      And eurasia lawyers are due to begin annual review in 0 days

    Scenario Outline: Providers are sent weekly reminder emails
      When eurasia lawyers have annual review in "-<days>" days
      And the batch process has run
      And the worker process has run
      Then the reminder email for "<reminderWeek>" weeks is sent to eligible providers

        Examples:
            | days | reminderWeek |
            | 8                     | 1            |
            | 15                    | 2            |
            | 22                    | 3            |
            | 29                    | 4            |
            | 36                    | 5            |


  Scenario: Providers are not sent weekly reminder emails if one has been sent recently
    When eurasia lawyers have annual review in "-8" days
    And the batch process has run
    And the worker process has run
    And the reminder email for "1" weeks is sent to eligible providers
    And the worker process has run
    And the worker process has run
    Then the weeklyReminder emails were not re-sent




