Feature: List management deleting a list


  Scenario: A deleted list should not show in the list dashboard
    Given I am logged in as a "Administrator"
    And A "lawyers" list exists for Eurasia
    And  I visit the "/dashboard" url
    When I click the link "Settings" in the row with header "Lawyers in Eurasia"
    And I click the "Delete list" button
    And I click the "Delete list" button
    Then I should not be able to see the "Lawyers in Eurasia" link
    And I see the notification text "The list Lawyers - Eurasia has been deleted"
