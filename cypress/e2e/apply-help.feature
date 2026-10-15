Feature: Application help and policy pages
  I want to see Privacy, Cookie, Accessibility and T&Cs

  Background:

  Scenario Outline: Open application privacy, cookies, terms and accessibility pages
    Given I am applying
    When I click the link "<link>"
    Then I see "<found>"

    Examples:
      | link                    | found                                                    |
      | Privacy                 | Introduction                                             |
      | Cookies                 | Cookies are files saved on your phone                    |
      | Terms and Conditions    | By using this digital service you                        |
      | Accessibility Statement | This service is scheduled for user testing in early 2022 |
