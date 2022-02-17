Feature:
  I want to see Privacy, Cookie, Accessibility and T&Cs

  Background:

  Scenario Outline:
    Given I am applying
    When I click the link "<link>"
    Then I see "<found>"

    Examples:
      | link                    | found                                                    |
      | Privacy                 | Introduction                                             |
      | Cookies                 | Cookies are files saved on your phone                    |
      | Terms and Conditions    | By using this digital service you                        |
      | Accessibility Statement | This service is scheduled for user testing in early 2022 |
