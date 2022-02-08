Feature:
  I want to see Privacy, Cookie, Accessibility and T&Cs

  Background:
  Scenario Outline:
    Given I am applying
    When I click the link "<link>"
    Then I see "<found>"

    Examples:
      | link                    | found                                 |
      | Privacy                 | Privacy Notice                        |
      | Cookies                 | Cookies are files saved on your phone |
      | Terms and Conditions    | By using this digital service you     |
