Feature: Check correct email is sent to provider this is about to be unpublished

  Background: Setup list and provider
    Given A "lawyers" list exists for Eurasia
    And eurasia lawyers are due to begin annual review
    And a list item has been with the provider for 100 days

  Scenario: Provider is sent a reminder email the day before they're unpublished
    When 1 days before unpublish
    And the batch process has run
    And the worker process has run
    Then the unpublish reminder email for 1 days is sent to eligible providers

  Scenario: The provider is not sent a reminder email on the day they're unpublished
    When 0 days before unpublish
    And the batch process has run
    And the worker process has run
    Then the unpublish reminder email is not sent

  Scenario: Provider is NOT sent an email two days before the unpublish date
    When 2 days before unpublish
    And the batch process has run
    And the worker process has run
    Then the unpublish reminder email is not sent

  Scenario: Provider is NOT sent an email if entry is edited before unpublish date
    When 1 days before unpublish
    And the batch process has run
    And the provider with reference "SCHEDULER_TESTS" has edited their details
    And the worker process has run
    Then the unpublish reminder email is not sent to user with reference "SCHEDULER_TESTS"


