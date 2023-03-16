Feature: Emails sent on key dates

  As consular staff,
  I should get emails before the Annual Review start date,
  so that I can delay it if I need to

  As consular staff,
  I should get emails on the Annual Review start date,
  so that I am made aware the providers will be removed from the system if they don't respond within 6 weeks

  As a provider,
  I should get emails on the annual review start date,
  so that I can review and confirm my details are up to date

  Background:
    Given A "lawyers" list exists for Eurasia
    And eurasia lawyers are due to begin annual review
    And the batch process has run

  Scenario:
    Given the current time is within the "POST_ONE_MONTH" key date range
    When the worker process has run
    Then the "POST_ONE_MONTH" key date email is sent to post

  Scenario:
    Given the current time is within the "POST_ONE_WEEK" key date range
    When the worker process has run
    Then the "POST_ONE_WEEK" key date email is sent to post

  Scenario:
    Given the current time is within the "POST_ONE_DAY" key date range
    When the worker process has run
    Then the "POST_ONE_DAY" key date email is sent to post

  Scenario:
    Given the current time is within the "START" key date range
    When the worker process has run
    Then the "START" key date email is sent to post
    And an email for the "START" key date is sent to eligible providers
