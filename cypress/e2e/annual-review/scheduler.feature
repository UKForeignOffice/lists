Feature: Provider annual review confirmation


  Scenario:
    Given A "lawyers" list exists for Eurasia
    And eurasia lawyers are due to begin annual review
    And the batch process has run
    Then I see "eggs"

