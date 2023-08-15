Feature:
  As a provider, I want to be able to access the sign up form

  Scenario Outline: I can reach the apply form via the find route
    Given I am searching for <serviceType>
    When I click the link "apply to be added to this service"
    Then I should see the heading "Apply to be added to the 'Find a <title> abroad' service"

    Examples:
      | serviceType                | title  |
      | "lawyers"                  | lawyer |
      | "funeral-directors"        | funeral director |
      | "translators-interpreters" | translator or interpreter |
