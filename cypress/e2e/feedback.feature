Feature:
  I want to give feedback

  Scenario:
    Given I am giving feedback
    When I select "Yes"
    And I continue
    And I select "Neutral"
    And I continue
    And I select "Neutral"
    And I continue
    And I continue
    And I select "Neutral"
    And I continue
    And I continue
    Then I see "Thank you"

