Feature:
  As a provider, I want to be able to access the sign up form

  Scenario Outline: I can reach the apply form via the find route
    Given I am searching for <serviceType>
    When I click the link "apply to be added to this service"
    Then I should see the heading "<title>"

    Examples:
      | serviceType                | title  |
      | "lawyers"                  | Apply to be added to the 'Find a lawyer abroad' service |
      | "funeral-directors"        | Apply to the ‘Find an English-speaking funeral director abroad’ service |
      | "translators-interpreters" | Apply to the 'Find an English-speaking translator or interpreter abroad’ service |
