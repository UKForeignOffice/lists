Feature: Provider annual review confirmation


    Background:
        Given I click on the link from the confirmation email

    Scenario: Show error if no option is selected
        And I see page with heading "Check that your information is still correct"
        When I click the "Continue" button
        Then I should see the error "Select if your information is correct or if you need to update it"


    Scenario: Show declaration page if yes option is chosen
        When I click the "Yes, I confirm my information is still correct" radio button
        And I click the "Continue" button
        Then I see page with heading "Declaration"


    Scenario: Show declaration page error
        When I click the "Yes, I confirm my information is still correct" radio button
        And I click the "Continue" button
        And I click the "Submit" button
        Then I should see the error "You must select the declaration box to proceed"


    Scenario: Show success page
        When I click the "Yes, I confirm my information is still correct" radio button
        And I click the "Continue" button
        And I check the "Confirmed" checkbox
        And I click the "Submit" button
        Then I see page with heading "Application resubmitted"


    Scenario: Show error page after visitng same page
        Then I see page with heading "You have already submitted your annual review"