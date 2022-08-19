Feature:
	List management actions

	Background:
		Given I am logged in as a "SuperAdmin"
		And A funeral directors list exists for Eurasia
		And there are these list items
			| contactName | organisationName       | emailAddress               | status | isPublished | isBlocked | isApproved | emailVerified | displayedRadioButtons          | hiddenRadioButtons           | service          |
			| Lola        | Lola Funeral Directors | smoke@cautionyourblast.com | NEW    | false       | false     | false      | true          | Publish,Request changes,Remove | Unpublish,Confirm and update | funeralDirectors |
			| Nima        | Nima and Sons          | smoke@cautionyourblast.com | NEW    | false       | false     | false      | true          | Publish,Request changes,Remove | Unpublish,Confirm and update | funeralDirectors |
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


	# Scenario Outline: Request changes for list item
	# 	When I am viewing the list item details for "<contactName>"
	# 	And The textarea should show if I click the Request changes radio button
	# 	And I enter a message in the textarea
	# 	And I click the "Continue" button
	# 	Then I should see the provider details "<contactName>", "<organisationName>" and "smoke@cautionyourblast.com"
	# 	And I click the "Request changes" button
	# 	Then I see the notification text "Change request sent to <organisationName>"

	# 	Examples:
	# 		| contactName | organisationName       |
	# 		| Lola        | Lola Funeral Directors |
	# 		| Nima        | Nima and Sons          |


	Scenario Outline: Publish list item
		When I am viewing the list item details for "<contactName>"
		And I click the "Publish" radio button
		And I click the "Continue" button
		And I click the "Publish" button
		Then I see the notification text "<organisationName> has been published"

		Examples:
			| contactName | organisationName       |
			| Lola        | Lola Funeral Directors |
			| Nima        | Nima and Sons          |


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
			| Nima        | Nima and Sons          |


	Scenario: Confirm and update list item
		When I am viewing the list item details for "Nima"
		And I click the "Confirm and update" radio button
		And I click the "Continue" button
		And I click the "Update" button
		Then I see the notification text "Nima and Sonshas been updated and published"


	Scenario: Unpublish list item
		When I am viewing the list item details for "Lola"
		And I click the "Unpublish" radio button
		And I click the "Continue" button
		And I click the "Unpublish" button
		Then I see the notification text "Lola Funeral Directorshas been unpublished"
