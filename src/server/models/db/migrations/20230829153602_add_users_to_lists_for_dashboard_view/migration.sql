-- This migration adds a new column called `userEmails` to the `ListsForDashboard` view.
-- The column will be of type an array of strings

DROP VIEW IF EXISTS "ListsForDashboard";

create or replace view "ListsForDashboard" as (

  with filteredListItem as (
    select
      "listId",
      sum(case when "status" in ('EDITED', 'CHECK_ANNUAL_REVIEW', 'NEW') then 1 else 0 end) as "actionNeeded",
      count(*) filter (where "isPublished") as live
    from "ListItem"
    where "jsonData"->'metadata'->'emailVerified' is not null
    group by "listId"
  )

  select
    l.id "listId",
    l.type,
    c.name "country",
    l."nextAnnualReviewStartDate",
    l."lastAnnualReviewStartDate",
    coalesce(li.live, 0) as live,
    coalesce(li."actionNeeded", 0) as "actionNeeded",
    coalesce(l."lastAnnualReviewStartDate", fp."firstPublished", current_date) + interval '18 months' < current_date as "isOverdue",
    count(ltu."B") as "admins", -- updated column
    array_agg(ltu."B") as "userIds" -- new column
  from
    "List" l
      inner join "Country" c on  c.id = l."countryId"
      left outer join "FirstPublishedOnList" fp on fp."listId" = l.id
      left join filteredListItem li on li."listId" = l.id
      left outer join "_ListToUser" ltu on l.id = ltu."A"
  group by l.id, c.name, fp."firstPublished", li.live, li."actionNeeded"
);
