# Annual Review email events

2023-09-29

A new nullable column has been added to both `Event` and `Audit` - `annualReviewEmailType` which are enums. This will help with querying the different types of email types, where previously the approach was inconsistent between tables.

For Audit, you may search for these annual review emails:
- oneMonthBeforeStart // sent one month before nextAnnualReviewStartDate
- oneWeekBeforeStart // sent one week before
- oneDayBeforeStart  // sent one day before
- started // sent day of start
- oneDayBeforeUnpublish // sent one day before unpublishing

For ListItem, you may search for these annual review emails:
- started // sent day of nextAnnualReviewStartDate
- weeklyUnpublish // sent every week until unpublish date
- oneDayBeforeUnpublish // sent day before unpublish
- unpublished // sent day of unpublishing



```postgresql
select * from "Audit" where "annualReviewEmailType" = 'oneMonthBeforeStart';
```

```postgresql
select * from "Audit" where "annualReviewEmailType" = 'started';
```

When annual review data is generated, `List.jsonData.currentAnnualReview`, it is now also added to the the `Audit` table. After an annual review ends, it is now easier to aggregate annual review Audits and Events.

```postgresql
-- get object describing the scheduled times of the emails which includes the reference
select "jsonData"->'currentAnnualReview' from "Audit" where "auditEvent" = 'ANNUAL_REVIEW' and "jsonData"->>'eventName' = 'startAnnualReview';

-- get just the reference
select "jsonData"->'currentAnnualReview'->'reference' reference from "Audit" where "auditEvent" = 'ANNUAL_REVIEW' and "jsonData"->>'eventName' = 'startAnnualReview';

-- get audits relating to reference
with annual_review as (select "jsonData"->'currentAnnualReview'->'reference' reference from "Audit" where "auditEvent" = 'ANNUAL_REVIEW' and "jsonData"->>'eventName' = 'startAnnualReview')
     select * from "Audit" join annual_review on annual_review.reference = "Audit"."jsonData"->'annualReviewRef' or annual_review.reference = "Audit"."jsonData"->'reference' ;

-- get Events relating to reference
with annual_review as (select "jsonData"->'currentAnnualReview'->'reference' reference from "Audit" where "auditEvent" = 'ANNUAL_REVIEW' and "jsonData"->>'eventName' = 'startAnnualReview')
select * from "Event" join annual_review on annual_review.reference = "Event"."jsonData"->'annualReviewRef' or annual_review.reference = "Event"."jsonData"->'reference';
```

