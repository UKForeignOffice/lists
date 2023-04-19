Feature: Check correct email is sent to provider this is about to be unpublished

  Background: Setup list and provider
    Given A "lawyers" list exists for Eurasia

  Scenario Outline: Provider is sent a differnt unpublish email based on weeks since annual review
    When eurasia lawyers have annual review in "0" days
    And the batch process has run
    And todays date is "<daysAfterAnnualReview>" days after annual review
    Then the unpublish reminder email for "<reminderDays>" days is sent to eligible providers

    Examples:
      | daysAfterAnnualReview | reminderDays |
      | 41                    | 1            |
