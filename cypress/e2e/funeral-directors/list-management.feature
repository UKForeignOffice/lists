Feature:
	List management actions

	Background:
		Given I am logged in as a "SuperAdmin"
		And A funeral directors list exists for Eurasia
		And there are these list items
			| contactName | organisationName       | emailAddress               | status    | isPublished | isBlocked | isApproved | emailVerified | displayedRadioButtons                     | hiddenRadioButtons                         | service          |
			| Lola        | Lola Funeral Directors | smoke@cautionyourblast.com | NEW       | false       | false     | false      | true          | Publish,Request changes,Remove            | Unpublish,Confirm and update               | funeralDirectors |
			| Nima        | Nima And Sons          | smoke@cautionyourblast.com | NEW       | false       | false     | false      | true          | Publish,Request changes,Remove            | Unpublish,Confirm and update               | funeralDirectors |
			| Tristen     | Peace Funerals         | smoke@cautionyourblast.com | EDITED    | false       | false     | false      | true          | Request changes,Confirm and update,Remove | Publish,Unpublish                          | funeralDirectors |
			| Catherine   | C & A Reed             | smoke@cautionyourblast.com | PUBLISHED | true        | false     | false      | true          | Unpublish, Remove                         | Publish,Request changes,Confirm and update | funeralDirectors |
		Given I am viewing list item index for reference:SMOKE


	Scenario Outline: View list item details
		When I am viewing the list item details for "<contactName>"
		Then I see radio buttons "<radioButtons>"
		And I do not see radio buttons "<radioButtonsConfirm>"
		And The textarea should show if I click the Request changes radio button

		Examples:
			| contactName | radioButtons                   | radioButtonsConfirm          |
			| Lola        | Publish,Request changes,Remove | Unpublish,Confirm and update |
			| Nima        | Publish,Request changes,Remove | Unpublish,Confirm and update |


	Scenario Outline: Request changes for list item
		When I am viewing the list item details for "<contactName>"
		And The textarea should show if I click the Request changes radio button
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
		And I click the "Remove" radio button
		And I click the "Continue" button
		Then I should see the provider details "<contactName>", "<organisationName>" and "smoke@cautionyourblast.com"
		And I click the "Remove" button
		Then I see the notification text "<organisationName> has been removed"

		Examples:
			| contactName | organisationName       |
			| Lola        | Lola Funeral Directors |
			| Nima        | Nima And Sons          |


	Scenario: Confirm and update list item
		When I am viewing the list item details for "Tristen"
		And I click the "Confirm and update" radio button
		And I click the "Continue" button
		And I click the "Update" button
		Then I see the notification text "Peace Funerals has been updated and published"


	Scenario: Unpublish list item
		When I am viewing the list item details for "Catherine"
		And I click the "Unpublish" radio button
		And I click the "Continue" button
		And I click the "Unpublish" button
		Then I see the notification text "C & A Reed has been unpublished"

	Scenario Outline: Show expected fields on list detail
		Given I am viewing the list item details for "Lola"
		Then I should see "<rowLabel>" with a value of "<rowValue>" on row number "<rowPosition>"

		Examples:
			| rowLabel                                      | rowValue                                                 | rowPosition |
			| Contact name                                  | Lola                                                     | 1           |
			| Local services                                | Local burials, Flower arrangements, Exhumations          | 2           |
			| Provided services to British nationals before | Yes                                                      | 3           |
			| Repatriation services                         | Body repatriation, Ashes repatriation (from a cremation) | 4           |
			| Contact name                                  | Lola                                                     | 5           |
			| Email address for GOV.UK                      | smoke@cautionyourblast.com                               | 6           |
			| Telephone                                     | 1234567                                                  | 7           |
			| Email - private                               | smoke@cautionyourblast.com                               | 8           |