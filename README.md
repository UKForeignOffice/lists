# FCDO Lists

## Architecture

### Server

Main Technologies:

- [Typescript](https://www.typescriptlang.org/)
- [NodeJS](https://nodejs.org/en/)
- [ExpressJS](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend)
- [Mozilla Nunjucks](https://mozilla.github.io/nunjucks/)
- [Jest](https://jestjs.io/)

The lists server is a NodeJs/Typescript application built on top of ExpressJS, all HTML is server side rendered and we are using govuk-frontend library for components, the client-side Javascript is minimal with only scripts required by govuk-frontend components and a few polyfills.

### Form runner

The lists server depends on [XGovFormBuilder/digital-form-builder](https://github.com/XGovFormBuilder/digital-form-builder) to deploy form journeys for data ingestion, this is how it works:

1. During the build the CI executes the `src/server/components/formRunner/install-form-runner.sh` script which installs and configures the form-runner application inside the lists container (under `/lib` folder)
2. When the lists server is starting it first initializes the form-runner on a separate process, which becomes available on `PORT:3001` and only once the form-runner is responding then the lists server starts listening to requests. At this stage both services are now running in parallel inside the same container, lists server on `PORT:3000` and form-runner on `PORT:3001`
3. Lists server is the only application responding to external requests and it has a form-runner middleware responsible for proxying all requests from `/application/{formName}` to the form-runner application running on `http://localhost:3001`, allowing user's to go through form journeys seamlessly
4. Once users complete a form-journey application the form-runner posts the data to (`localhost:3000/ingest/:serviceType`) and the lists application validates and ingests the data


### Databases

**PostgreSQL**

We are using Postgres on AWS RDS with Postgis extension for spatial queries.
The server's data layer is built using [Prisma ORM](https://www.prisma.io/) and you can find the database schema specification in `src/server/models/db/schema.prisma`.
We are using a mix between relational and JSONB so we can benefit from relational structured data and also have the flexibility of unstructured schemas for the various types of lists we are planning to work with. **Important**: Because Prisma doesn't support PostGIS types and advanced JSONB operators, some queries are handwritten instead of using prisma models.

**Redis**

Redis is used on both lists and form-runner applications to store user sessions and for other caching purposes.

### AWS Location Service

The lists server also depends on [AWS Location Service](https://aws.amazon.com/location/) for geo location data.


## Development

#### Starting local development required services

Lists depends on both Postgres and Redis, and you can start these services by running:

```bash
docker-compose up
```

Compose will start the following:

1. `PostgreSQL`: The PostgreSQL database with PostGIS, accessible on [http://localhost:5432](http://localhost:5432)
2. `PgAdmin`: The PgAdmin GUI app so you can manage the database, accessible on [http://localhost:8080](http://localhost:8080)
3. `PgHero`: A performance dashboard for Postgres, accessible on [http://localhost:8081](http://localhost:8081)
4. `Redis`: The Redis database, accessible on [http://localhost:6379](http://localhost:6379)
5. `RedisInsight`: Redis desktop GUI so you can manager the database, accessible on [http://localhost:8001](http://localhost:8001)

Note: See `docker-compose.yml` file for respective usernames and passwords.

### Local environment variables

Ideally try ot get a `.env` file from another engineer, otherwise please create the file in the root of the project and configure all the environment variables listed below.

Lists variables:

| name                        |  type   | required | description                                                                                                |
| --------------------------- | :-----: | :------: | :--------------------------------------------------------------------------------------------------------- |
| DEBUG                       | boolean |  false   | Enable logger service metadata logging                                                                     |
| LOG_LEVEL                   | string  |  false   | Set logger service log level, possible values are error (default), warn, info, http, verbose, debug, silly |
| LOCAL_HOST                  | boolean |  false   | Remember to set this to true when running locally                                                          |
| SERVICE_NAME                | string  |   true   | The name of the service used in HTML templates such as page header and titles                              |
| SERVICE_DOMAIN              | string  |   true   | The domain in which this service is running e.g: `localhost:3000`                                          |
| DATABASE_URL                | string  |   true   | Postgres connection url, e.g: postgresql://postgresuser:postgrespass@localhost:5432/lists                  |
| REDIS_HOST                  | string  |   true   | Redis host address e.g: localhost                                                                          |
| REDIS_PORT                  | number  |   true   | Redis port number address 6379 localhost                                                                   |
| AWS_ACCESS_KEY_ID           | string  |   true   | AWS access key id                                                                                          |
| AWS_SECRET_ACCESS_KEY       | string  |   true   | AWS secret access key                                                                                      |
| LOCATION_SERVICE_INDEX_NAME | string  |   true   | AWS location service index name                                                                            |
| GOVUK_NOTIFY (various)      | string  |   true   | Several GOVUK Notify variables are required, please see `govuk-notify.ts` for a fll list                   |

Form runner variables:

| name    |  type   | required | description                                                                             |
| ------- | :-----: | :------: | :-------------------------------------------------------------------------------------- |
| sandbox | boolean |  false   | Configure form-runner to work locally with a single redis instance instead of a cluster |

### Starting Lists service
```
npm run dev
```

To above command will start the service in watch mode and whenever you change any file the application will be recompiled and restarted. 


### Preparing the database

```bash
npm run prisma:reset
```

The above npm script will invoke `prisma migrate` and this is what is going to happen:

- Database will reset and **all data will be removed**
- All prisma migrations will be applied

### Codebase

    .
    ├── .circleci                 # CircleCI configurations
    ├── .github                   # Github configuration such as workflows and dependabot
    ├── .husky                    # Husky git hooks configuration
    ├── .jest                     # Jest related configuration files
    ├── .vscode                   # VSCode related settings
    ├── config                    # Local development configuration files, such as local postgres config file
    ├── dist                      # Babel's build output folder (npm start/dev points here)
    ├── src
    │   ├── client                # Client side related code and assets such as styles and images.
    │   ├── server                # NodeJS server codebase
    |   |   ├── components        # Server features are self-contained (besides views) within the various folders here 
    |   |   |   ├── config            # Environment configuration files
    |   |   ├── middlewares       # Express middlewares
    |   |   ├── models            # Postgres schema, models and helpers
    |   |   ├── services          # Various services the application integrates with
    |   |   ├── utils             # Several utility helper functions
    |   |   ├── views             # Nunjucks html views
    │   └── types.d.ts            # Typescript's global type definition file
    ├── LICENSE
    └── README.md

Webpack will watch `/src` folder and will rebuild when changes occur, then Nodemon will restart the application whenever a file changes inside `/dist`.

### Code Style and Lint

For code styling and formatting we are using:

- [https://standardjs.com/](https://standardjs.com)
- [eslint-config-standard-with-typescript](https://www.npmjs.com/package/eslint-config-standard-with-typescript)
- [https://prettier.io/](https://prettier.io/)

### Pre-Commit and Pre-Push Hooks

Lint and prettier formatting will be run on a pre-commit hook and Typescript type check will be run on a pre-push hook.
To by pass them you can use the `--no-verify` flag, e.g: `git commit -m 'msg' --no-verify`.

## Continuous Integration

We are following [Github flow](https://guides.github.com/introduction/flow/) and CI is going to run tests and various checks once you open a PR to master, if all checks pass you'll be able to merge it.

We use [CircleCI](https://circleci.com) for CI. Config for this is committed alongside the code, in .circleci/config.yml. The pipeline is here: https://app.circleci.com/pipelines/github/UKForeignOffice/lists

## Deploy Development Environment

Push your changes to `deploy-dev` branch and the CI will build and deploy the development environment (you might need to use "the `--force`").

```bash
git push origin HEAD:deploy-dev --force
```

## Continuous Delivery

We manage releases with [Github Release](https://docs.github.com/en/github/administering-a-repository/managing-releases-in-a-repository) and to deploy a new production version of the application please follow these steps:

1. Update package.json with the correct [Semantic Version](https://semver.org/)
2. Create a new release with Github Release tool, please make sure you add a good title and description of changes
3. Once a new tag is released the CI will test, build and deploy the production environment
4. Please make sure the new version has been released successfully, for that open the production application and check the footer, make sure the version number is the same as in the package.json file


