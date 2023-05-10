-- This is a migration to help get the correct data for the relevant rows in on the list management dashboard page

create view "ListsForDashboard" as (

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
    l."jsonData",
    coalesce(li.live, 0) as live,
    coalesce(li."actionNeeded", 0) as "actionNeeded",
    coalesce(l."lastAnnualReviewStartDate", fp."firstPublished", current_date) + interval '18 months' < current_date as "isOverdue",
    jsonb_array_length(l."jsonData" -> 'users') as "admins"
  from
    "List" l
      inner join "Country" c on  c.id = l."countryId"
      left outer join "FirstPublishedOnList" fp on fp."listId" = l.id
      left join filteredListItem li on li."listId" = l.id
  group by l.id, c.name, fp."firstPublished", li.live, li."actionNeeded"
);
