-- This is a migration to help get the correct data for the relevant rows in on the list management dashboard page

create view "ListsForDashboard" as (

  with "filteredListItem" as (
    select
      "listId",
      sum(case when "status" in ('EDITED', 'CHECK_ANNUAL_REVIEW', 'NEW') then 1 else 0 end) actionNeeded,
      count(*) filter (where "isPublished") live
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
    li.live,
    li.actionNeeded,
    (case when coalesce(l."lastAnnualReviewStartDate", fp."firstPublished") + interval '18 months' < current_date then true else false end) as "isOverdue",
    jsonb_array_length(l."jsonData" -> 'users') as "admins"
  from
    "List" l
      inner join "Country" c on  c.id = l."countryId"
      left outer join "FirstPublishedOnList" fp on fp."listId" = l.id
      join "filteredListItem" li on li."listId" = l.id
  group by l.id, c.name, fp."firstPublished", li.live, li.actionNeeded
);