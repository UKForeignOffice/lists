Feature:

  Redirect from old /results page to /find/{serviceType}/result


  Scenario: Old lawyers results loads parameters and redirects to new url
    When I navigate to "/results?serviceType=lawyers&practiceArea=maritime%2Creal%20estate&readNotice=ok&country=Spain&region=madrid"
    Then I should see the heading "Lawyers in Spain"
    And the answer for "Location" is "Madrid"
    And the answer for "Country" is "Spain"
    And the answer for "Areas of law" is "Maritime, Real Estate"

  Scenario: Old translators results loads parameters and redirects to new url
    When I navigate to "/results?serviceType=translatorsInterpreters&readNotice=ok&country=Poland&region=Not%20set&servicesProvided=translation&languagesProvided=pl&newLanguage=&languagesPopulated=true&languagesConfirmed=true&readDisclaimer=ok"
    Then I should see the heading "Translators in Poland"
    And the answer for "Country" is "Poland"
    And the answer for "Location" is "Not set"
    And the answer for "Services needed" is "translation"

  Scenario: Old translators and interpreters results loads parameters and redirects to new url
    When I navigate to "/results?serviceType=translatorsInterpreters&readNotice=ok&country=Italy&region=Not%20set&servicesProvided=translation,interpretation&languagesProvided=it&newLanguage=&languagesPopulated=true&languagesConfirmed=true&translationSpecialties=Legal,Medical&interpreterServices=Courts%20and%20legal,Events&interpreterTranslationServices=&readDisclaimer=ok"
    Then I should see the heading "Translators and interpreters in Italy"
    And the answer for "Country" is "Italy"
    And the answer for "Location" is "Not set"
    And the answer for "Services needed" is "translation, interpretation"
    And the answer for "Translation types" is "Legal, Medical"
    And the answer for "Interpretation types" is "Courts and legal, Events"

  Scenario: Old translators and interpreters results loads parameters and redirects to new url
    When I navigate to "/results?serviceType=translatorsInterpreters&readNotice=ok&country=Italy&region=Not%20set&servicesProvided=translation,interpretation&languagesProvided=it&newLanguage=&languagesPopulated=true&languagesConfirmed=true&translationSpecialties=Legal,Medical&interpreterServices=Courts%20and%20legal,Events&interpreterTranslationServices=&readDisclaimer=ok"
    Then I should see the heading "Translators and interpreters in Italy"
    And the answer for "Country" is "Italy"
    And the answer for "Location" is "Not set"
    And the answer for "Services needed" is "translation, interpretation"
    And the answer for "Translation types" is "Legal, Medical"
    And the answer for "Interpretation types" is "Courts and legal, Events"

  Scenario: Old funeral directors results loads parameters and redirects to new url
    When I navigate to "/results?serviceType=funeralDirectors&readNotice=ok&insurance=yes&contactInsurance=done&repatriation=yes&country=Italy&region=Not%20set&readDisclaimer=ok"
    Then I should see the heading "Funeral directors in Italy"
    And the answer for "Country" is "Italy"
    And the answer for "Location" is "Not set"
    And the answer for "Repatriation needed" is "Yes"
    And the answer for "Has insurance" is "Yes"



