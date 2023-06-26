Feature:
As consular staff,
  I should see that non-respondents to the annual review request are unpublished automatically,
  So that I know citizens will be able to find responsive providers


  Scenario:
    Given A "lawyers" list exists for Eurasia
    And eurasia lawyers are due to begin annual review
    And a list item has been with the provider for 100 days with the reference "UNPUBLISH_DAY_TEST"
    When 0 days before unpublish
    And the batch process has run
    And the worker process has run
    And I am logged in as a "Admin"
    And I am viewing list item index for reference:SMOKE
    Then I see "Buster"
    And I see "ANNUAL REVIEW OVERDUE"
    And the provider with reference "UNPUBLISH_DAY_TEST" should be unpublished

# Scenario: A list item is deleted after being unpublished for a year
#   Given A "lawyers" list exists for Eurasia
#   And eurasia lawyers have finished annual review
#   And a list item has been unpuiblished for over a year
#   And the worker process has run
#   Then the list item should be deleted
