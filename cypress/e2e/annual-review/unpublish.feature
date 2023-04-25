Feature: Check correct email is sent to provider this is about to be unpublished

  Background: Setup list and provider
    Given A "lawyers" list exists for Eurasia

  Scenario Outline: Provider is sent a differnt unpublish email based on weeks since annual review
    When eurasia lawyers are due to begin annual review
    And a list item has been with the provider for 60 days
    And annual review date was <daysAfterAnnualReview> days ago
    When the worker process has run
    Then the unpublish reminder email for <reminderDays> days is sent to eligible providers

    Examples:
      | daysAfterAnnualReview | reminderDays |
      | 41                    | 1            |
