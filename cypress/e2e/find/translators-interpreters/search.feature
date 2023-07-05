Feature:

  I want to search for translators and/or interpreters

  Background:
    Given I am searching for translators or interpreters
    When I click the link "Start"
    And I choose the country "Italy"
    And I continue
    And I continue

  Scenario: Only translation
    When I select "Translation of written content"
    And I continue
    And I enter the language "Italian"
    And I enter the language "Spanish"
    And I continue
    And I click the link "Continue"
    And I "check" the "Select all" checkbox for "Select the type of translation that you need"
    And I continue
    And I have read the disclaimer


  Scenario: Only Interpretation
    When I select "Interpretation of spoken language"
    And I continue
    And I enter the language "Italian"
    And I enter the language "Spanish"
    And I continue
    And I click the link "Continue"
    And I "check" the "Select all" checkbox for "Select the situation that you need an interpreter for"
    And I continue
    And I have read the disclaimer


  Scenario: both translation and interpretation
    When I select "Interpretation of spoken language"
    When I select "Translation of written content"
    And I continue
    And I enter the language "Italian"
    And I enter the language "Spanish"
    And I continue
    And I click the link "Continue"
    And I "check" the "Select all" checkbox for "Select the type of translation that you need"
    And I "check" the "Select all" checkbox for "Select the situation that you need an interpreter for"
    And I continue
    And I have read the disclaimer
