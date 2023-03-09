Feature: Check correct email is sent to provider that has had edits requested


    Background: Setup list and provider
        Given A "lawyers" list exists for Eurasia


    Scenario: Provider has not responded for 3 days
        When eurasia lawyers have annual review in "-15" days
        And the batch process has run
        And the worker process has run