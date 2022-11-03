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

The lists server depends on [XGovFormBuilder/digital-form-builder](https://github.com/XGovFormBuilder/digital-form-builder)
to deploy form journeys for data ingestion. The base docker images for the form runner have already been built.

**To add new forms:**
1. Add or replace a form configuration in `docker/apply/forms-json/`
2. The form runner will create a new route matching the file name.
i.e. adding `lawyers.json` would make a form available at `lists-apply:3001/lawyers`


To start the form runner
```sh
$ docker compose -f docker-compose.ci.yml up apply
```

By default, it will start on port 3001. It will be accessible from your local machine at localhost:3001.
Since it is running inside a docker network, it can be accessed by other docker containers at `lists-apply(:3001)`.

Once users complete a form-journey application the form-runner posts the data to `localhost:3000/ingest/:service`.

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

However, you may also set environment variables via `docker/apply/config/*.json`. At runtime, if the `NODE_ENV` matches the config file name,
those environment variables will be used. See a complete list of environment variables and what they do in the [XGovFormBuilder/runner/config/default.js file](https://github.com/XGovFormBuilder/digital-form-builder/blob/main/runner/config/default.js).

### Getting started

Follow the instructions [here](docs/getting-started.md) to get started.

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

Push your changes to `deploy-test` branch and the CI will build and deploy the development environment (you might need to use "the `--force`").

```bash
git push origin HEAD:deploy-test --force
```

## Continuous Delivery

All code merged or committed to the `master` branch will be automatically versioned using [Semantic Release](https://github.com/semantic-release/semantic-release).

Semantic Release will read the commit messages and increment the version number accordingly as well as automatically publishing a release on GitHub with auto generated release notes.

## Commit messages

This project uses Conventional Commits to version the package correctly and generate release notes. To find out more about Conventional Commits and how to use them, [click here](https://www.conventionalcommits.org/en/v1.0.0/).

You can generate valid commit messages by running `npm run commit` and following the instructions on your terminal window. Windows users should use the Bash terminal from the Windows Subsystem for Linux to run this.

All commit messages are run through a validator and any invalid commit messages will be rejected.
