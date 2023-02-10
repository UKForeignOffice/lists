
## Overview

Diagrams can be found in [./scheduler/assets]('./scheduler/assets'). 
* [Entity relationship diagram]('./sheduler/assets/ERD.svg)
* [Batch process overview]('./sheduler/assets/batch.svg)
* [Worker process overview]('./sheduler/assets/batch.svg)
  * [Worker reminder emails]('./sheduler/assets/worker-reminder-emails.svg)
  * [Worker stateful changes]('./sheduler/assets/worker-stateful.svg)

Every day at 10:50 and 11:00 the batch process and worker process will run at their respective times. The batch process checks which lists should enter annual review, and which list items are eligible. The batch process will create a json object and appends it to \`List.jsonData\`. The worker process uses this object to perform state changes or send emails.


### Batch process

The batch process will a json object `currentAnnualReview` and appends it to `List.jsonData`.

```
// List.jsonData
{
  users: Array<User.id>,
  currentAnnualReview: {
    reference: UUID,
    eligibleListItems: Array<ListItem.id>,
    keyDates: {
      annualReview: {
        POST_ONE_MONTH: ISODateString, // should be 1 month before start date
        POST_ONE_WEEK: ISODateString, // should be 1 week before 
        POST_ONE_DAY: ISODateString, // 1 day before..
        START: ISODateString // This should match ListItem.nextAnnualReviewDate
      },
      unpublished: {
        PROVIDER_FIVE_WEEKS: ISODateString,
        PROVIDER_FOUR_WEEKS: ISODateString,
        PROVIDER_THREE_WEEKS: ISODateString,
        PROVIDER_TWO_WEEKS: ISODateString,
        ONE_WEEK: ISODateString, // 1 week before the unpublish date
        ONE_DAY: ISODateString, // 1 day before the unpublish date
        UNPUBLISH: ISODateString // This should be 6 weeks after the start date
      }
    }
  }
}
```

A list item must be published for at least a month (4 weeks) to be eligible for an annual review.

Errors are unlikely to happen in the batch process. Direct database edits to the currentAnnualReview object can be made if anything fails.

These dates can be changed if they are erroneous, but care must be taken that it does not overlap with another range.

You can change the dates via a direct database edit, or by going to `/dashboard/lists/$id/development`. This is accessible by administrators only.

`reference` can be used to query related events.

#### Error messages

`Unable to retrieve List Items for Lists ${listIds} ${error/stack}`

`findListItemsForLists Error ${error/stack}`

- Cause: finding eligible list items failed. Possibly due to incorrect query or an issue with the database connection.
- fix: check the status of the database, is it available and accessible from the lists container.  Check the version of prisma client used in /node_modules and verify that it’s not been updated and if it has, check if there are any breaking changes that could have been introduced.

### Worker

The worker process will use the `currentAnnualReview` object to determine which emails to send and which state changes to perform.

If an email/state change fails, and the keyDate is still “relevant”, it will be retried the next day (or next time the job is run). For example, if today’s date is between `annualReview.POST_ONE_MONTH` and `annualReview.POST_ONE_WEEK` , and the email has not been sent successfully, it will be retried. If `annualReview.POST_ONE_MONTH` email failed, but today’s date is between `annualReview.POST_ONE_WEEK` and `annualReview.POST_ONE_DAY`, the `POST_ONE_MONTH` email will not be retried.

#### Error messages

- `Unable to send annual review email to post contacts ${list.jsonData.users} for list ${list.id} ${milestoneTillAnnualReview} before annual review start`

Cause: Issue with [gov.uk](http://gov.uk) notify or the request to notify. Emails to `post` do not need to be retried if at least one has been sent.

Fix: Check the email addresses associated with the List to ensure they’re valid email addresses and clean up / remove any that are invalid.  Emails can be sent from notify as a fallback.

- `List items [...] were not updated for annual review start`

Cause: this is a safety net condition prior to performing the database update and produced when there are no list items passed to the `updateIsAnnualReview` function.

Fix:

- Re-run the cron job to see if the issue persists
- Check logs if a log has been emitted for the mentioned listId
- Check the list items referenced in the currentAnnualReview.eligibleListItems field to ensure the listId matches to the list id referenced in the logs.

#### Debug steps

- To find events that have happened on `ListItem` relating to an annual review
  ```sql
  -- get the reference --
  select "jsonData"->'currentAnnualReview'->'reference' from "List" where id = 0;

  -- find the ListItemEvent
  select * from "Event" where "jsonData"->'reference' = XX;

  -- find the audit event (events for non-ListItem entities)
  select * from "Audit" where "jsonData"->'reference' = XX;

  ```
- To find key dates associated with a given list

```
select "jsonData"->'currentAnnualReview'->'keyDates' from "List" where id = 0;
```

- To find eligible list items associated with a list

```
select "jsonData"->'currentAnnualReview'->'eligibleListItems' from "List" where id = 0;
```
