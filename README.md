# FCDO Lists
TODO

## Development

### Develop using `docker-compose`

`docker-compose up` to start the following services:

1. `server`: The lists application which is accessible on `PORT:3000`
2. `PostgreSQL`: The PostgreSQL database with PostGis which is accessible on `PORT:5432` (please see `docker-compose.yml` file for database user and password)
3. `pgadmin`: The PgAdmin GUI app so you can manage the database, it is accessible on `PORT:8080` (please see `docker-compose.yml` file for user and password)

If you like you can start each service independently:
1. `docker-compose up server`
1. `docker-compose up postgres`
1. `docker-compose up pgadmin`

To force a rebuild (for example if a new npm module has been installed) use the --build flag `docker-compose up server --build`

### Debugging
If you are using VSCode the debugger is already configured with `Docker: Attach to Node`, just start debugging and enjoy it.

### PgAdmin

Use PgAdmin service to connect and manage Postgres, run `docker-compose up pgadmin` and open the service at `http://localhost:8080/` (user and password are in `docker-compose.yml` file).  

Then create a server with the following connection settings: 
`HostName=postgres`,  username and password (see `docker-compose.yml` `POSTGRES_USER` and `POSTGRES_PASSWORD`) 

### Codebase 
The application code resides inside `/src` folder and Nodemon will watch for changes and rebuild/restart the application inside docker.
Important: When the application is build inside docker a dist folder will be created on your workspace, this is necessary so VSCode debugging works properly.

### Coding Style and Lint
We are using [https://standardjs.com/](https://standardjs.com), [eslint-config-standard-with-typescript](https://www.npmjs.com/package/eslint-config-standard-with-typescript) and [https://prettier.io/](https://prettier.io/) for code styling and formatting.

### Pre-commit Hooks
Lint and prettier formatting will be run on a pre-commit hook, to by pass it jut use the `--no-verify` flag, e.g: "git commit -m 'msg' --no-verify".

## Continuous Integration
TODO:Semantic release

