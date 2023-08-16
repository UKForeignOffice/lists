Feature:
  I want to apply to be added to the ‘Find a lawyer abroad’ service but the list does not exist.

  Scenario: A list that does not exist
    Given I am searching for "lawyers"
    When I click the link "apply to be added to this service"
    And I click the "Start now" button
    # Commonwealth countries should not have a list
    And I choose the country "New Zealand"
    And I continue
    Then I should see the heading "We are not currently accepting online applications for this list"
    And I see "which represents the UK in New Zealand"
  Scenario: User cannot jump to a form page without answering the initial question
    When I navigate to "/application/lawyers/what-size-is-your-company-or-firm"
    Then I should see the heading "Apply to be added to the 'Find a lawyer abroad' service"

  Scenario: User cannot change their country answer and skip to form pages
    Given I navigate to "/application/lawyers/start"
    And I click the "Start now" button
    And I choose the country "Italy"
    And I continue
    When I navigate to "/application/lawyers/which-list-of-lawyers"
    And I choose the country "New Zealand"
    And I continue
    Then I should see the heading "We are not currently accepting online applications for this list"
    When I navigate to "/application/lawyers/what-size-is-your-company-or-firm"
    Then I should see the heading "Apply to be added to the 'Find a lawyer abroad' service"

  Scenario: Back link
    Given I am searching for "lawyers"
    When I click the link "apply to be added to this service"
    And I click the "Start now" button
    And I choose the country "Italy"
    And I continue
    Then I should see the heading "What size is your company or firm?"
    When I click the link "Back"
    Then I should see the heading "Which list of lawyers do you want to be added to?"
