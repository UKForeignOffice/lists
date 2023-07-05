Feature:

  I want to change my translators and interpreters answers


  Background:
    Given I am searching for translators or interpreters
    When I click the link "Start"
    And I choose the country "Italy"
    And I continue
    And I continue
    When I select "Translation of written content"
    And I continue
    And I enter the language "Italian"
    And I enter the language "Spanish"
    And I continue
    And I click the link "Continue"
    And I check the "Select all" checkbox for "Select the type of translation that you need"
    And I continue
    And I have read the disclaimer

#  Scenario: Changing services needed to interpretation
#    Given the answer for "Services needed" is "translation"
#    And there is no answer for "Interpretation types"
#    When I click Change "what services do you need answer"
#    And I select "Interpretation of spoken language"
#    And I select "Translation of written content"
#    And I continue
#    And I check the "Select all" checkbox for "Select the situation that you need an interpreter for"
#    And I continue
#    Then  I should see the heading "Interpreters in Italy"
#    And the answer for "Services needed" is "interpretation"
#    And the answer for "Interpretation types" is "all"
#    And there is no answer for "Translation types"
#
#
#  Scenario: Changing services needed to both
#    Given the answer for "Services needed" is "translation"
#    And there is no answer for "Interpretation types"
#    When I click Change "what services do you need answer"
#    And I select "Interpretation of spoken language"
#    And I continue
#    And I check the "Select all" checkbox for "Select the situation that you need an interpreter for"
#    And I continue
#    Then  I should see the heading "Translators and interpreters in Italy"
#    And the answer for "Services needed" is "translation"
#    And the answer for "Interpretation types" is "all"


  Scenario: Changing languages needed
    Given the answer for "Languages needed" is "Italian, Spanish; Castilian"
    When I click Change "languages answer"
    And I click the link "Remove es"
    And I enter the language "French"
    And I continue

#  Scenario: Only translation
#
#
#
#  Scenario: Only Interpretation
#    When I select "Interpretation of spoken language"
#    And I continue
#    And I enter the language "Italian"
#    And I enter the language "Spanish"
#    And I continue
#    And I click the link "Continue"
#    And I check the "Select all" checkbox for "Select the situation that you need an interpreter for"
#    And I continue
#    And I have read the disclaimer
#
#
#  Scenario: both translation and interpretation
#    When I select "Interpretation of spoken language"
#    When I select "Translation of written content"
#    And I continue
#    And I enter the language "Italian"
#    And I enter the language "Spanish"
#    And I continue
#    And I click the link "Continue"
#    And I check the "Select all" checkbox for "Select the type of translation that you need"
#    And I check the "Select all" checkbox for "Select the situation that you need an interpreter for"
#    And I continue
#    And I have read the disclaimer
