Feature:
  I want to apply to be added to the ‘Find a lawyer abroad’ service

  Background:

  Scenario Outline:
    Given I want to apply to be added as a "<profession>"
    When I select the option "<country>"
    And I continue
    And my company is "<size>"
    And I "<support>" provide legal services and support to customers in English
    And I enter my regulators
    And my given names are "<givenNames>"
    And I enter my address "<line1>" "<line2>" "<town>" "<postCode>" "<country>"
    And I enter my email with "<alternativeEmail>"
    And I enter my phone number with "<alternativeNumber>"
    And I enter my website "<websiteAddress>"
    And I enter my regions "<regions>"
    And I select <areas>
    And I continue
    And I "<aid>" provide legal aid
    And I "<proBono>" provide pro bono
    And I "<represented>" represented british nationals before
    And I declare
    And I continue
    Then I see "Check your email"

    Examples:
      | profession | country | size        | aid   | proBono | areas                 | support | givenNames  | websiteAddress | regions                  | represented | line1 | line2 | town | postCode | alternativeNumber | alternativeEmail |
      | lawyers    | Italy   | independent | can   | can     | [Bankruptcy,Criminal] | can     | Cathy Yves  | https://gov.uk | Lazio, Calabria, Abruzzo | have        |       |       |      |          |                   |                  |
      | lawyers    | Italy   | small       | can't | can't   | [Bankruptcy,Criminal] | can     | Cody        | https://gov.uk | Lazio                    | have        |       |       |      |          |                   |                  |
      | lawyers    | Italy   | medium      | can   | can     | [Bankruptcy,Criminal] | can     | Carly Bella | https://gov.uk | Lazio                    | have        |       |       |      |          |                   |                  |
      | lawyers    | Italy   | large       | cant  | can't   | [Bankruptcy,Criminal] | can     | Palmerston  | https://gov.uk | Lazio                    | haven't     |       |       |      |          |                   |                  |

