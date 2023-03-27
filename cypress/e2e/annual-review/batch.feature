Feature: Eligible list items are calculated correctly

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

  Scenario:
    When eurasia lawyers are due to begin annual review
    And the batch process has run
    Then eligible list items are correct


  Scenario: A date is added automatically if one is not set
    And there is a list item published 60 days ago
    And no annual review date is set
    And the batch process has run
    Then an annual review date has been set


  Scenario: A date in the future is set if the first published date was over a year ago
    And there is a list item published over a year ago
    And no annual review date is set
    And the batch process has run
    Then an annual review date has been set
