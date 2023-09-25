Feature: Export a lisItem data as a CSV

Scenario: Clicking on the export link should produce a csv file
  Given I am logged in as a "Administrator"
  And A "lawyers" list exists for Eurasia
  When I click the link "Settings" in the row with header "Lawyers in Eurasia"
  # And I click the link "Export list as CSV"
  Then A csv file with the name "Eurasia-Lawyers" should download

# Scenario: Don't show export link if I am not a super admin
#   Given I am logged in as a "non super admin"
#   And A "lawyers" list exists for Eurasia
#   When I click the link "Settings" in the row with header "Lawyers in Eurasia"
#   Then I should not see "Export list as CSV"
