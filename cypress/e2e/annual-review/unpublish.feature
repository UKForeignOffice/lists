Feature: Check correct email is sent to provider this is about to be unpublished

  Background: Setup list and provider
    Given A "lawyers" list exists for Eurasia
    And eurasia lawyers are due to begin annual review
    And a list item has been with the provider for 60 days

  Scenario Outline: Provider is sent a an email the day before they're unpublish
    When <daysBeforeUnpublish> days before unpublish
    And the batch process has run
    And the worker process has run
    Then the unpublish reminder email for <reminderDays> days is sent to eligible providers

    Examples:
      | daysBeforeUnpublish | reminderDays |
      | 41                  | 1            |
      | 42                  | 0            |
      | 43                  | -1           |


  Scenario: Provider is NOT sent an email if entry is edited before unpublish date
    And 42 days before unpublish
    And the batch process has run
    And the worker process has run
    Then the unpublish reminder email is not sent

  Scenario: Provider is NOT sent an email two days before the unpublish date
    And 40 days before unpublish
    And the batch process has run
    And the worker process has run
    Then the unpublish reminder email is not sent
