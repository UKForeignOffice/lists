# FCDO Lists

## Development

#### Starting Lists Server

You can start all services by running:

```bash
docker-compose up
```

Compose will start the following services:

1. `lists`: The lists application, accessible on `PORT:3000`
2. `PostgreSQL`: The PostgreSQL database with PostGIS, accessible on `PORT:5432`
3. `pgadmin`: The PgAdmin GUI app so you can manage the database, accessible on `PORT:8080`
4. `pghero`: A performance dashboard for Postgres, accessible on `PORT:8081`

If you like you can start each service independently:

1. `docker-compose up lists`
2. `docker-compose up postgres`
3. `docker-compose up pgadmin`
4. `docker-compose up pghero`

To force a rebuild (for example if a new npm module has been installed) use the **--build** flag `docker-compose up --build lists`

### Preparing the database

After starting the services the next step is to prepare the database, first run the following command:

```bash
npm run prisma:migrate
```

Then with the application running, open the browser and navigate to `http://localhost:3000/dev/reset-db`.

This is what is going to happen:

- Database will reset and **all data will be removed**
- Postgis extension is installed
- GeoLocation table is created
- Data is seeded

### Debugging

If you are using VSCode the debugger is already configured with `Docker: Attach to Node` (see `.vscode/launch.json`), just start debugging and enjoy it.

### PgAdmin

Use PgAdmin service to connect and manage Postgres, run `docker-compose up pgadmin` and open the service at `http://localhost:8080/`.

- `username=dev@gov.uk`
- `password=password`

Then create a server with the following connection settings:

- `HostName=postgres`
- `username=postgresuser`
- `password=postgrespass`

### Codebase

    .
    ├── .circleci                 # CircleCI configurations
    ├── .github                   # Github configuration such as workflows, dependabot and etc
    ├── .jest                     # Jest related configuration files, such as environment variables
    ├── .vscode                   # VSCode related settings
    ├── config                    # General development configuration files not directly related to the source code, such as local postgres config file
    ├── dist                      # Babel's build output folder (npm start/dev points here)
    ├── src
    │   ├── client                # Client side related code and assets such as styles and images.
    │   ├── form-runner           # Form runner forms JSON files and it's install script (please read the Architecture section below)
    │   ├── server                # NodeJS server codebase
    │   └── types.d.ts            # Typescript's global type definition file
    ├── LICENSE
    └── README.md

Webpack will watch `/src` folder and will rebuild when changes occur, then Nodemon will restart the application whenever a file changes `/dist`.
Note: When the application is build inside docker a `/dist` folder will be created on your workspace, this is necessary so VSCode debugging works properly.

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

Server is a NodeJs/Typescript application built on top of ExpressJS and the codebase organisation is based on Model-View-Controller.
All HTML is server side rendered and we are using govuk-frontend library for components, we want to keep client-side Javascript minimal with only scripts needed by govuk-frontend components.

### Database

We are using Postgres on AWS RDS with Postgis extension for spatial queries.
The server's data layer is built using Prisma ORM and you can find the database schema specification in `src/server/models/db/schema.prisma`.
We are using a mix between relational and JSONB, this way we can benefit from relational structured data and have the flexibility of unstructured schemas for the various professional services we are planning to integrate with. If you read the database schema you will see that the `ListItem` model contains both structured types and also the jsonData column which is JSONB.

**Important**: Because Prisma doesn't support PostGIS types and advanced JSONB operators, most queries are handwritten instead of using prisma models.

### FormRunner

Lists also depends on [XGovFormBuilder/digital-form-builder](https://github.com/XGovFormBuilder/digital-form-builder) to deploy form journeys for data ingestion, for example when lawyers want to submit their data to join the service.

The form-runner is controlled by the server and this is how it works:

1. During the build the CI executes the `src/form-runner/install-form-runner.sh` script, this script installs and configures the form-runner application inside the lists image (under `/lib` folder).
2. When the lists server is starting it also initializes the form-runner as a child process, which becomes available on `PORT 3001`. At this stage both services are now running in parallel inside the same pod, lists server on `PORT 3000` and form-runner on `PORT 30001`.
3. Lists server has a form-runner middleware which proxies requests from `/application/{formName}` to the form-runner, allowing user's to go through form journeys.
4. Once users complete their application, the form-runner posts the data to (`localhost:30000/ingest/:serviceType`), the route controller validates and ingests the data.

### AWS Location Service

Lists server also depends on [AWS Location Service](https://aws.amazon.com/location/) for geo location data.
