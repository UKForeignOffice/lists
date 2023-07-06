Feature:

  I want to search for funeral directors

  Background:
    Given I am searching for funeral directors

  Scenario: Has insurance
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

