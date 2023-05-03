-- This is a migration to help get the correct data for the relevant rows in on the list management dashboard page
create view "ListsForDashboard" as (
  select
    l.id "listId",
    l.type "type",
    c.name "country",
    l."nextAnnualReviewStartDate" "nextAnnualReviewStartDate",
    l."lastAnnualReviewStartDate" "lastAnnualReviewStartDate",
    l."jsonData" "jsonData",
    (coalesce(l."nextAnnualReviewStartDate", fp."firstPublished")  + interval '18 months' < current_date) as "isOverdue",
    count(li.*) filter (where li."isPublished") as "live",
    jsonb_array_length(l."jsonData" -> 'users') as "admins",
    sum(case when li."status" in ('EDITED', 'CHECK_ANNUAL_REVIEW', 'NEW') then 1 else 0 end) as "actionNeeded"
  from
    "List" l
      inner join "Country" c on  c.id = l."countryId"
      inner join "FirstPublishedOnList" fp on fp."listId" = l.id
      left join "ListItem" li on li."listId" = l.id
  group by l.id, c.name, fp."firstPublished"
);