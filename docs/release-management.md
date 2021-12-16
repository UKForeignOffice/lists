# Release management

All releases are automatically generated when code is pushed or merged into the `master` branch.

When code is pushed into the `master` branch, the [Release](https://github.com/UKForeignOffice/lists/actions/workflows/release.yml) GitHub Action will be run. This GitHub Action will use `semantic-release` to read the Conventional Commit messages to generate the correct version number and release notes which will then be published on [GitHub](https://github.com/UKForeignOffice/lists/releases).

When the release is generated, CircleCI will then trigger another Pipeline that will build the Docker container for the release and publish it to AWS ECS. This container can then be used for deployments.

The container will be tagged with the version number set on the release.
