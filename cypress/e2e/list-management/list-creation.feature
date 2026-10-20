Feature: List creation

    Scenario: Require a country before creating a list
        Given I am logged in as a "Administrator"
        When I click the link "Create New List"
        And I click the "Lawyers" radio button
        And I enter "smoke@cautionyourblast.com" for "Enter an FCDO email address"
        And I click the "Create" button
        Then I should see the error "Select a country or territory"
        And I see page with heading "Create a new list"

    Scenario: Show error if duplicate list created
        Given I am logged in as a "Administrator"
        And A "lawyers" list exists for Eurasia
        When I click the link "Create New List"
        And I click the "Lawyers" radio button
        And I choose the country "France"
        And I enter "smoke@cautionyourblast.com" for "Enter an FCDO email address"
        And I click the "Create" button
        Then I should see the error "A list of Lawyers in France already exists"