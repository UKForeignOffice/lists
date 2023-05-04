Feature: Check that a provider is sent a reminder email only on the day before they are unpublished

  As a provider,
  if I have not responded, I want to be sent a "final reminder" the day before I am unpublished,
  So that I have a chance to update my details and stay on the list

  As a provider,
  if I have not responded, I do not want to be sent a "final reminder" the day before I am unpublished,
  Since I would already be unpublished and will have conflicting emails

  As a provider,
  if I have responded, I do not want to be sent a "final reminder",
  Since I have responded in the correct timeframe

  Background:
    Given A "lawyers" list exists for Eurasia
    And eurasia lawyers are due to begin annual review
    And a list item has been with the provider for 100 days with the reference "DAY_BEFORE_UNPUBLISH_TEST"

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
    And the provider with reference "DAY_BEFORE_UNPUBLISH_TEST" has edited their details
    And the worker process has run
    Then the unpublish reminder email is not sent to user with reference "DAY_BEFORE_UNPUBLISH_TEST"


