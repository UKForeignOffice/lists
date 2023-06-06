Feature: List management change annual review date

  Background:
    Given I am logged in as a "Administrator"
    And A "lawyers" list exists for Eurasia


  Scenario: Links to related lists are shown
    When a related list exists
    And I click the link "Lists"
    And I click the link "Settings" in the row with header "Lawyers in Eurasia"
    Then I see "Find a funeral director in Eurasia"

  Scenario: Custom links can be added
    When I click the link "Settings" in the row with header "Lawyers in Eurasia"
    And I click the link "Add link"
    And I enter "Where to find eggs" for "Page title"
    And I enter "https://gov.uk" for "URL"
    And I click the link "Continue"
    Then I see "Where to find eggs"
    When I click the link "Continue"
    Then I see "A related link has been added"

    Scenario: Custom links can be changed
      When a related link exists
      And I click the link "Settings" in the row with header "Lawyers in Eurasia"
      And I click Change "How to find eggs"
      And I enter " (international guide)" for "Page title"
      And I enter "/government/organisations/foreign-commonwealth-development-office" for "URL"
      When I click the link "Continue"
      And I click the link "Continue"
      Then I see the link "How to find eggs (international guide)"
      Then I see "A related link has been updated"


  Scenario: Only GOV.UK links are allowed
    When I click the link "Settings" in the row with header "Lawyers in Eurasia"
    And I click the link "Add link"
    And I enter "Where to find eggs" for "Page title"
    And I enter "https://uk.gov" for "URL"
    And I click the link "Continue"
    Then I should see the error "You can only link to GOV.UK"



    Scenario: Custom links can be changed
      When a related link exists
      And I click the link "Settings" in the row with header "Lawyers in Eurasia"
      And I click Change "How to find eggs"
      And I click the "Remove" button
      Then I see "You removed a link to How to find eggs"


