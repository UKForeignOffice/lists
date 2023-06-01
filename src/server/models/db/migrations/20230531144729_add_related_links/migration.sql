update "List"
set "jsonData" = jsonb_set("jsonData", '{relatedLinks}',
    case "type"
        when 'lawyers'
        then coalesce("jsonData"->'relatedLinks', '[]') || '[
            {
                "url": "gov.uk/guidance/arrested-or-detained-abroad",
                "text": "Arrested or detained abroad"
            },
            {
                "url": "gov.uk/guidance/what-to-do-after-a-british-national-dies-abroad",
                "text": "What to do after a British national dies abroad"
            },
            {
                "url": "gov.uk/guidance/victim-of-crime-abroad",
                "text": "Victim of crime abroad"
            }
        ]'
        when 'funeralDirectors'
        then coalesce("jsonData"->'relatedLinks', '[]') || '[
            {
                "url": "gov.uk/guidance/what-to-do-after-a-british-national-dies-abroad",
                "text": "What to do after a British national dies abroad"
            },
            {
                "url": "gov.uk/government/publications/international-funeral-directors-in-the-uk/list-of-uk-based-international-funeral-directors--2",
                "text": "UK-based international funeral directors"
            },
            {
                "url": "gov.uk/after-a-death/organisations-you-need-to-contact-and-tell-us-once",
                "text": "Tell us once"
            }
        ]'
        when 'translatorsInterpreters'
        then coalesce("jsonData"->'relatedLinks', '[]') || '[
            {
                "url": "gov.uk/guidance/arrested-or-detained-abroad",
                "text": "Arrested or detained abroad"
            },
            {
                "url": "gov.uk/guidance/what-to-do-after-a-british-national-dies-abroad",
                "text": "What to do after a British national dies abroad"
            },
            {
                "url": "gov.uk/guidance/in-hospital-abroad",
                "text": "In hospital abroad"
            },
            {
                "url": "gov.uk/guidance/victim-of-crime-abroad",
                "text": "Victim of crime abroad"
            }
        ]'
        else "jsonData"
    end
);
