Feature:

  I want to change my answers


  Background: searching for a populated list
    Given I am searching for "lawyers" in "Italy" in "Rome"
    When I select [Bankruptcy,Criminal]
    And I continue
    And I have read the disclaimer


  Scenario: Changing the location
    When I click Change "country's area answer"
    And I enter "Lake como" for "Where in Italy do you want to find a lawyer? (Optional)"
    And I continue
    Then I see "Results for Lawyers in Italy"
    And the answer for "Location" is "Lake como"

  Scenario: Changing the areas of law
    When I click Change "area of law answer"
    And I select [Corporate,Bankruptcy,Criminal]
    And I continue
    Then I see "Results for Lawyers in Italy"
    And the answer for "Areas of law" is "Corporate"

  Scenario: Changing the Country
    When I click Change "country answer"
    And I choose the country "France"
    And I continue
    Then I see "Results for Lawyers in France"
    And the answer for "Country" is "Spain"
    And the answer for "Location" is "Not supplied"

