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

  Scenario:
    Given A "lawyers" list exists for Eurasia
    And eurasia lawyers are due to begin annual review
    When the batch process has run
    Then eligible list items are correct


