update "ListItem" li set "jsonData" =
                           jsonb_set("jsonData",
                                     '{religiousCulturalServicesProvided}',
                                     to_jsonb(li3.StringArray)) from (
    select li1.type, li1.id, li2.StringArray
    from "ListItem" li1
    inner join (
      select li2.id,
        (SELECT (case when "jsonData" ->> 'religiousCulturalServicesProvided' is null then '' else string_agg(trim(JsonString::text, '"'), ', ') end)
        from jsonb_array_elements_text(("jsonData" ->> 'religiousCulturalServicesProvided')::jsonb) JsonString) as StringArray
      from "ListItem" li2
      where li2."type" = 'funeralDirectors'
    ) li2 on li1.id = li2.id
    where li1.type = 'funeralDirectors'
  ) li3
where li."type" = 'funeralDirectors'
  and li3.id = li.id;
