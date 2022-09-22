Feature: I want to search for lawyers

  Background:

  Scenario Outline:
    Given I am searching for "<profession>" in "<country>" in "<city>"
    When I select <filters>
    And I continue
    And I have read the disclaimer
    Then I see "<found>"

    Examples:
      | profession | country | city   | filters               | found           |
      | lawyers    | Italy   | Sicily | [Bankruptcy,Criminal] | Serena Torrente |
      | lawyers    | Italy   | Sicily | [Bankruptcy,Criminal] | Serena Torrente |
