Feature: Provider annual review confirmation


    Background:
        Given A "lawyers" list exists for Eurasia
        And there are these list items
            | contactName | organisationName | emailAddress               | status    | isPublished | isAnnualReview |
            | Winston     | Winston Law      | smoke@cautionyourblast.com | PUBLISHED | true        | true           |
            | O'brien     | Brien Law        | smoke@cautionyourblast.com | PUBLISHED | true        | true           |
            | Julia       | Julia Law        | smoke@cautionyourblast.com | PUBLISHED | true        | true           |
        And the list is in annual review
        And I click on the link from the confirmation email

    Scenario: Show error if no option is selected
        And I see page with heading "Check that your information is still correct"
        When I click the "Continue" button
        Then I should see the error "Select if your information is correct or if you need to update it"


    Scenario: Show declaration page if yes option is chosen
        When I click the "Yes, I confirm my information is still correct" radio button
        And I click the "Continue" button
        Then I see page with heading "Declaration"


    Scenario: Summary page after declaration if no option is chosen
        When I click the "No, I need to update my information" radio button
        And I click the "Continue" button
        And I see page with heading "Declaration"
        And I check the "I have read and agree with this statement" checkbox
        And I click the "Submit" button
        Then I see page with heading "Check your answers"


    Scenario: Show declaration page error
        When I click the "Yes, I confirm my information is still correct" radio button
        And I click the "Continue" button
        And I click the "Submit" button
        Then I should see the error "You must select the declaration box to proceed"


    Scenario: Show success page
        When I click the "Yes, I confirm my information is still correct" radio button
        And I click the "Continue" button
        And I check the "I have read and agree with this statement" checkbox
        And I click the "Submit" button
        Then I see page with heading "Application resubmitted"


    Scenario: Show error page after visitng same page
        When I click the "Yes, I confirm my information is still correct" radio button
        And I click the "Continue" button
        And I check the "I have read and agree with this statement" checkbox
        And I click the "Submit" button
        And I go back to confirmation page
        Then I see page with heading "You have already submitted your annual review"
