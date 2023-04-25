Feature: Check correct email is sent to provider this is about to be unpublished

  Background: Setup list and provider
    Given A "lawyers" list exists for Eurasia
    And eurasia lawyers are due to begin annual review

  Scenario Outline: Provider is sent a differnt unpublish email based on weeks since annual review
    When a list item has been with the provider for 60 days
    And annual review date was <daysAfterAnnualReview> days ago
    And the batch process has run
    And the worker process has run
    Then the unpublish reminder email for <reminderDays> days is sent to eligible providers

    Examples:
      | daysAfterAnnualReview | reminderDays |
      | 41                    | 1            |
      | 42                    | 0            |
      | 43                    | -1           |


  Scenario: Provider is NOT sent an email if entry is edited before unpublish date
    When a list item has been edited by the provider 60 days ago
    And annual review date was 42 days ago
    And the worker process has run
    Then the unpublish reminder email is not sent

  Scenario: Provider is NOT sent an email two days before the unpublish date
    When a list item has been with the provider for 60 days
    And annual review date was 40 days ago
    And the worker process has run
    Then the unpublish reminder email is not sent
