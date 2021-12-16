# Scripts

The following `npm` scripts are available for you to use;

- `dev` - Runs the application locally.
- `deploy-test` - Deploys the current commit hash to the test environment.
- `environment` - Runs services needed for the application.
- `build:prod` - Builds production-ready application bundle.
- `commit` - CLI tool that will generate a Conventional Commit message.
- `start:prod` - Runs the production-ready application bundle.
- `type-check` - Type checks application codebase.
- `lint` - Checks codebase for any linting errors.
- `lint:fix` - Checks codebase for any linting errors and fixes any that can be automatically.
- `test` - Runs all unit tests and outputs coverage
- `test:dev` - Runs tests in watch mode. Only code that has been altered will be tested.
- `test:coverage` - Runs all unit tests and outputs coverage.
- `prisma:generate` - Generates Prisma client based on Schema.
- `prisma:migrate` - Generates new Prisma database migration.
- `prisma:reset` - Reset database.
- `prisma:deploy` - Run Prisma migrations.
- `prepare:husky` - Set up Git hooks.
- `release` - Automatically generate a new release. Should only be used in CI.
- `form-runner:install` - Install Form Runner in the `lib` directory.
- `form-runner:start` - Start the Form Runner.
