Feature:

  Redirect from old /find?serviceType={serviceType} to /find/{serviceType}

  Scenario Outline: /find?serviceType=<serviceType> redirects to correct start page
    When I navigate to "/find?serviceType=<serviceType><country>"
    Then I should see the heading "<heading>"

    Examples:
      | serviceType             | country        | heading                                   |
      | lawyers                 |                | Find a lawyer abroad                      |
      | lawyers                 | &country=Italy | Find a lawyer in Italy                    |
      | translatorsInterpreters |                | Find a translator or interpreter abroad   |
      | translatorsInterpreters | &country=Italy | Find a translator or interpreter in Italy |
      | funeralDirectors        |                | Find a funeral director abroad            |
      | funeralDirectors        | &country=Italy | Find a funeral director in Italy          |

