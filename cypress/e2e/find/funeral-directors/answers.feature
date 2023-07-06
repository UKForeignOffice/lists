Feature:

  I want change my funeral directors answers

  Background:
    Given I am searching for funeral directors
    And I click the link "Start"
    And I click the "Yes" radio button
    And I continue
    Then I see "You should contact the insurance company"
    When I click the link "Continue"
    And I click the "Yes, I want to bring the body or ashes back to the UK." radio button
    And I continue
    And I choose the country "Italy"
    And I continue
    And I enter "Lake como" for "Where in Italy do you want to find a funeral director? (Optional)"
    And I continue
    And I have read the disclaimer

  Scenario: Changing the location
    When I click Change "country's area answer"
    And I enter "Venice" for "Where in Italy do you want to find a funeral director? (Optional)"
    And I continue
    Then I see "Results for Funeral directors in Italy"
    And the answer for "Location" is "Venice"

  Scenario: Changing the repatriation answer
    When I click Change "repatriation answer"
    And I click the "No, I do not want to bring the body or ashes back to the UK." radio button
    And I continue
    Then I see "Results for Funeral directors in Italy"
    And the answer for "Repatriation needed" is "No"


  Scenario: Changing the insurance answer
    When I click Change "has insurance answer"
    And I click the "No" radio button
    And I continue
    Then I see "Results for Funeral directors in Italy"
    And the answer for "Has insurance" is "No"
