Feature: List management actions

	Background:
		Given I am logged in as a "Administrator"
		And A "funeralDirectors" list exists for Eurasia
		And there are these list items
			| contactName | organisationName       | emailAddress               | status    | isPublished | service          |
			| Lola        | Lola Funeral Directors | smoke@cautionyourblast.com | NEW       | false       | funeralDirectors |
			| Nima        | Nima And Sons          | smoke@cautionyourblast.com | NEW       | false       | funeralDirectors |
			| Tristen     | Peace Funerals         | smoke@cautionyourblast.com | EDITED    | false       | funeralDirectors |
			| Luke        | Samba directors        | smoke@cautionyourblast.com | EDITED    | true        | funeralDirectors |
			| Catherine   | C & A Reed             | smoke@cautionyourblast.com | PUBLISHED | true        | funeralDirectors |
		Given I am viewing list item index for reference:SMOKE


	Scenario Outline: View list item details
		When I am viewing the list item details for "<contactName>"
		Then I see radio buttons "<radioButtons>"
		And I do not see radio buttons "<radioButtonsConfirm>"

		Examples:
			| contactName | radioButtons                      | radioButtonsConfirm     |
			| Lola        | Publish,Archive,Request changes | Remove,Confirm and update |
			| Nima        | Publish,Archive,Request changes | Remove,Confirm and update |


	Scenario Outline: Request changes for list item
		When I am viewing the list item details for "<contactName>"
    And I select "Request changes"
		And I enter a message in the textarea
		And I click the "Continue" button
		Then I should see the provider details "<contactName>", "<organisationName>" and "smoke@cautionyourblast.com"
		And I click the "Request changes" button
		Then I see the notification text "Change request sent to <organisationName>"

		Examples:
			| contactName | organisationName       |
			| Lola        | Lola Funeral Directors |
			| Nima        | Nima And Sons          |


	Scenario Outline: Publish list item
		When I am viewing the list item details for "<contactName>"
		And I click the "Publish" radio button
		And I click the "Continue" button
		And I click the "Publish" button
		Then I see the notification text "<organisationName> has been published"

		Examples:
			| contactName | organisationName       |
			| Lola        | Lola Funeral Directors |
			| Nima        | Nima And Sons          |


	Scenario Outline: Remove list item
		When I am viewing the list item details for "<contactName>"
		And I click the "Archive" radio button
		And I click the "Continue" button
		Then I should see the heading "Archive <organisationName>"
		And I click the "Archive" button
		Then I see the notification text "<organisationName> has been archived"

		Examples:
			| contactName | organisationName       |
			| Lola        | Lola Funeral Directors |
			| Nima        | Nima And Sons          |


	Scenario: Confirm and update unpublished list item
		When I am viewing the list item details for "Tristen"
		And I click the "Publish" radio button
		And I click the "Continue" button
		And I click the "Publish" button
		Then I see the notification text "Peace Funerals has been updated and published"


	Scenario: Confirm and update published list item
		When I am viewing the list item details for "Luke"
		And I click the "Update live version" radio button
		And I click the "Continue" button
		And I click the "Update" button
		Then I see the notification text "Samba directors has been updated and published"


	Scenario: Unpublish list item
		When I am viewing the list item details for "Catherine"
		And I click the "Unpublish" radio button
		And I click the "Continue" button
		And I click the "Unpublish" button
		Then I see the notification text "C & A Reed has been unpublished"

	Scenario: Show expected fields on list detail
		When I am viewing the list item details for "Lola"
		Then I should see these rows
			| rowLabel                                      | rowValue                                                 |
			| Regions                                       | France and UK                                            |
			| Local services                                | Local burials, Flower arrangements, Exhumations          |
			| Provided services to British nationals before | Yes                                                      |
			| Repatriation services                         | Body repatriation, Ashes repatriation (from a cremation) |
			| Contact name                                  | Lola                                                     |
			| Email address for GOV.UK                      | smoke@cautionyourblast.com                               |
			| Telephone                                     | 1234567                                                  |
			| Email - private                               | smoke@cautionyourblast.com                               |
