Feature: I want to apply to be added to the ‘Find a lawyer|funeral director|translator and interpreter abroad’ service but the list does not exist.

  Scenario Outline: A list that does not exist
    Given I am searching for <serviceType>
    When I click the link "apply to be added to this service"
    And I click the "Start now" button
    # Commonwealth countries should not have a list
    And I choose the country "New Zealand"
    And I continue
    Then I should see the heading "We are not currently accepting online applications for this list"
    And I see "which represents the UK in New Zealand"

    Examples:
      | serviceType                |
      | "lawyers"                  |
      | "funeral-directors"        |
      | "translators-interpreters" |

  Scenario Outline: User cannot jump to a form page without answering the initial question
    When I navigate to <postCountrySelectPage>
    Then I should see the heading <title>

    Examples:
      | postCountrySelectPage                                                                                                  | title                                                                              |
      | "/application/lawyers/what-size-is-your-company-or-firm"                                                               | "Apply to be added to the 'Find a lawyer abroad' service"                          |
      | "/application/funeral-directors/can-you-provide-funeral-services-and-support-to-customers-in-english"                  | "Apply to the ‘Find an English-speaking funeral director abroad’ service"          |
      | "/application/translators-interpreters/can-you-provide-translation-or-interpretation-services-to-customers-in-english" | "Apply to the 'Find an English-speaking translator or interpreter abroad’ service" |

  Scenario Outline: User cannot change their country answer and skip to form pages
    Given I navigate to <startPage>
    And I click the "Start now" button
    And I choose the country <country>
    And I continue
    When I navigate to <countrySelectPage>
    And I choose the country "New Zealand"
    And I continue
    Then I should see the heading "We are not currently accepting online applications for this list"
    When I navigate to <postCountrySelectPage>
    Then I should see the heading <title>

    Examples:
      | startPage                                     | country     | countrySelectPage                                                                     | postCountrySelectPage                                                                                                  | title                                                                              |
      | "/application/lawyers/start"                  | "Italy"     | "/application/lawyers/which-list-of-lawyers"                                          | "/application/lawyers/what-size-is-your-company-or-firm"                                                               | "Apply to be added to the 'Find a lawyer abroad' service"                          |
      | "/application/funeral-directors/start"        | "Argentina" | "/application/funeral-directors/which-country-list-do-you-want-to-be-added-to"        | "/application/funeral-directors/can-you-provide-funeral-services-and-support-to-customers-in-english"                  | "Apply to the ‘Find an English-speaking funeral director abroad’ service"          |
      | "/application/translators-interpreters/start" | "Poland"    | "/application/translators-interpreters/which-country-list-do-you-want-to-be-added-to" | "/application/translators-interpreters/can-you-provide-translation-or-interpretation-services-to-customers-in-english" | "Apply to the 'Find an English-speaking translator or interpreter abroad’ service" |

  Scenario Outline: Back link
    Given I am searching for <serviceType>
    When I click the link "apply to be added to this service"
    And I click the "Start now" button
    And I choose the country <country>
    And I continue
    Then I should see the heading <title>
    When I click the link "Back"
    Then I should see the heading "Which country list do you want to be added to?"

    Examples:
      | serviceType                | country     | title                                                                             |
      | "lawyers"                  | "Italy"     | "What size is your company or firm?"                                              |
      | "funeral-directors"        | "Argentina" | "Can you provide funeral services and support to customers in English?"           |
      | "translators-interpreters" | "Poland"    | "Can you provide translation or interpretation services to customers in English?" |
