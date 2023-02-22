Feature: Emails sent on key dates

  As a provider,
  I should be included in the annual review process if I have been published for over a month,
  so that users can see my updated details

  As a provider,
  I should not be included in the annual review process if I have been published for under a month,
  so that I do not have to review my details that have recently been reviewed

  As consular staff,
  I should only review providers that have been published for over a month,
  So that I do not have to verify details that have been recently reviewed.

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
    And an email for the "START" key date is sent to providers
