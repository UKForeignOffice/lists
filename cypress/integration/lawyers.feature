Feature:

  I want to search for lawyers

  Background:

  Scenario Outline:
    Given I am searching for "<profession>" in "<country>" in "<city>"
    When I select <filters>
    And I continue
    And I am <aid> interested in legal aid
    And I am <probono> interested in pro bono
    And I have read the disclaimer
    Then I see "<found>"





    Examples:
      | profession | country | city | aid | probono | filters               | found              |
      | lawyers    | Italy   | Rome |     |         | [Bankruptcy,Criminal] | Davide Cupertino   |
      | lawyers    | Italy   | Rome | No  | No      | [Bankruptcy,Criminal] | Davide Cupertino   |

