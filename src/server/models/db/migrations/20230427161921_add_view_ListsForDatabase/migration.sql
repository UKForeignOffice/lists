-- This is an wip migration, please comment out before you do a project-wide migration
create view "ListsForDashboard" as (
  select l.id "listId", l.type "type", c.name "country", l."nextAnnualReviewStartDate" "nextAnnualReviewStartDate", l."lastAnnualReviewStartDate" "lastAnnualReviewStartDate", fp."firstPublished" "firstPublished", ld."nextAnnualReviewStartDate" "annualReviewOverdue"
  from "List" l
           inner join "Country" c on  c.id = l."countryId"
           inner join "FirstPublishedOnList" fp on fp."listId" = l.id
           inner join (select id, "nextAnnualReviewStartDate" from "List" where "nextAnnualReviewStartDate" + interval '18 months' < current_date) ld on ld.id = l.id
);