Feature: List creation

    Scenario: Show error if duplicate list created
        Given I am logged in as a "Administrator"
        And A "lawyers" list exists for Eurasia
        When I click the link "Create New List"
        And I click the "Lawyers" radio button
        And I choose the country "France"
        And I click the "Create" button
        Then I should see the error "A list of Lawyers in France already exists"