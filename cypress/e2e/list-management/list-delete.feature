Feature: List management deleting a list

  Scenario: A deleted list should not show in the list dashboard
    Given I am logged in as a "Administrator"
    And A "funeralDirectors" list exists for Eurasia
    And  I visit the "/dashboard" url
    When I click the link "Settings" in the row with header "Funeral Directors in Eurasia"
    And I click the "Delete list" button
    And I click the "Delete list" button
    Then I should not be able to see the "Funeral Directors in Eurasia" link
    And I see the notification text "The list Funeral Directors - Eurasia has been deleted"
