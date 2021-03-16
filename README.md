# Docker Node.js Express Typescript Seed

Seed project with Node.js, Express, TypeScript and Nunjucks.

Features:

- Multi stage docker build for improved build performance
- Prettier for code formatting
- Eslint extending [eslint-config-standard-with-typescript](https://github.com/standard/eslint-config-standard-with-typescript#readme) and prettier
- Pre-commit with Husk and lint-staged running prettier and lint fix
- Logging with [winston](https://github.com/winstonjs/winston) (console.log is disallowed via lint)
- Middlewares
  - Compression
  - Security
    - [Helmet](https://github.com/helmetjs/helmet)
- Development
  - Run the application with [docker-compose](https://docs.docker.com/compose/)
  - Vscode debugger settings ready

## Development

Develop using `docker-compose` and no more "works on my machine".

`docker-compose up`

Nodemon will watch for changes in your `src`, rebuild and restart the application.

_debugging_
If you are using Vscode the debugger is already configured with `Docker: Attach to Node`, just start debugging and enjoy it.
