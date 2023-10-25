# Adding a new list type

## Creating and processing a new form (apply)

### Creating a new form 
**1. Create a new form using [XGovFormBuilder](https://github.com/XGovFormBuilder/digital-form-builder).**

It is recommended that you start from an existing form first, like [lawyers.json](./docker/apply/forms-json/lawyers.json).
This is so common fields are handled the same across all forms, and easier to render on the find application later.

Common fields used across lawyers, funeral directors and translators and interpreters are 
- `contactName`
- `organisationName`
- `regions`
- `size`
- `address.firstLine`
- `address.secondLine`
- `city`
- `postCode`
- `addressCountry`
- `emailAddress`
- `publicEmailAddress`
- `publishEmail`
- `phoneNumber`
- `contactPhoneNumber`
- `declaration`
- `representedBritishNationals`
- `speakEnglish`

**2. In the `metadata` property, add the camel cased type of form**  

```json5
{ 
  //..
  metadata: {
    type: "notaries" // or "funeralDirectors"
  }
}

```

**3. Change the outputConfiguration url to `/ingest/<type>`**

Add the new file to the `forms-json` directory**

### Processing the new form (apply)
## Add the deserialisers 
After the user submits the data, it will go to the newly configured lists endpoint `http://lists:3000/ingest/<type>`.

This will be handled by the [ingestPostController](./src/server/components/lists/controllers/ingest/ingestPostController.ts)

IngestPostController will then attempt to deserialise the data into a ListItem.

1. Add the new service type to [./lists/src/shared/types.ts](./lists/src/shared/types.ts). This will help identify where code may need to be changed to accommodate the new type
1. Add the service name to [serviceName](./src/server/utils/service-name.ts)
1. Add a custom deserialiser, which converts XGovFormBuilder data type into the Lists type.
   1. The [baseDeserialiser](src/server/models/listItem/providers/deserialisers/index.ts) will flatten the object
   1. Create a new file, `<ServiceType>.deserialiser.ts`, with a function named `<serviceType>Deserialiser`. This function can make any additional conversions or override the base deserialiser's output
   1. Each deserialiser needs to add `country` from `addressCountry`
1. Add a new key to the [DESERIALISER](./src/server/models/listItem/providers/deserialisers/index.ts) Record

## Find application

The express router for the find/* endpoints can be found at [./src/server/components/lists/find/router.ts](./src/server/components/lists/find/router.ts)

If the service requires additional filtering on a new field, you will need to add a new route, the matching views, input sanitisation, the actual query to find the list items, and the results page. 

The find router uses the Post, Redirect, Get pattern. Post the form; redirect to either the same page if there was an error or to the next page; Get the resource. The Post handler should not render anything. 

### Add the start page for the new service 
When the user lands on `/find/<type>`, we will show them the `notice.njk` view. This is rendered by the `/find/:serviceType` route.

1. Create a new directory and notice.njk file `./src/server/views/lists/find/<service-type>/notice.njk`

Copying from an existing is recommended. Don't forget to replace any page titles or service specific text.

### Add the different filtering questions

1. Create the pages for your new filtering questions in `./src/server/views/lists/find/<service-type>/<question>.njk`
2. Create the new routes for them in [./src/server/components/lists/find/router.ts](./src/server/components/lists/find/router.ts)
   1. A get route handler will be needed to render the page
   2. A post route handler will be needed to handle the form submission
      1. The post handler needs to sanitise the user's input
      2. store it to session
      3. and redirect to the next page (or to the same page if there was an error)
         1. use `req.flash` to store the error message temporarily
3. Ensure the POST handler that should precede your new page, redirects to your new correct page
4. Render the answers box (grey box on righthand side) by adding `./lists/partials/<service-type>/answers-box.njk`
 

### Add the results page and query the database
1. Add a results page `./src/server/views/lists/find/<service-type>/results.njk` 
2. Add a function `find<serviceType>PerCountry` in [src/server/models/listItem/providers/<serviceType>](./src/server/models/listItem/providers/) - This will query the database
3. Add a function `search<serviceType>` in [./src/server/components/lists/searches](./src/server/components/lists/searches) - This will parse the session data and pass it onto `find<serviceType>perCountry`
4. Determine which fields to render and create a partial for it. See [./src/server/views/lists/partials/funeral-directors/funeral-directors-results-list.njk](./src/server/views/lists/partials/funeral-directors/funeral-directors-results-list.njk) as an example
