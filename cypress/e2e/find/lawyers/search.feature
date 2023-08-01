Feature:

  I want to search for lawyers


  Scenario: searching for a populated list
    Given I am searching for "lawyers" in "Italy" in "Rome"
    When I select [Bankruptcy,Criminal]
    And I continue
    And I have read the disclaimer
    Then I see "Al Assistenza Legale"


  Scenario: searching for a country with an empty lawyers list
    Given I am searching for "lawyers" in "Belize" in ""
    Then I am on the url "gov.uk/government/publications"


