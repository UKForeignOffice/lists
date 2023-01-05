# Release management

All releases are automatically generated when code is pushed or merged into the `master` branch or maintenance branches.

When the release is generated, CircleCI will then trigger another Pipeline that will build the Docker container for the release and publish it to AWS ECS. This container can then be used for deployments.

The container will be tagged with the version number set on the release.

## Mainline branch
All releases are automatically generated when code is pushed or merged into the `master` branch.

When code is pushed into the `master` branch, the [Release](https://github.com/UKForeignOffice/lists/actions/workflows/release.yml) GitHub Action will be run. This GitHub Action will use `semantic-release` to read the Conventional Commit messages to generate the correct version number and release notes which will then be published on [GitHub](https://github.com/UKForeignOffice/lists/releases).

## Maintenance releases

Releases are also automatically generated when code is pushed to a branch with a version range, e.g. `3.x.x`

Patch or minor releases can also be generated for versions which are behind the current version on `master`, without introducing new features.
This is useful for when the most recent version is several versions ahead of what is currently deployed on a production environment,
but a patch needs to be applied to an older version. 
 
Read more on [semantic-release's maintenance branch feature](https://github.com/semantic-release/semantic-release/blob/master/docs/recipes/release-workflow/maintenance-releases.md).

### Generating a maintenance release

For example, the current version is v3.20.1.

For patch release:
1. Determine which version needs patching e.g. v3.15.3 
   1. The most recent patch for a minor version needs to be selected. e.g. v3.15.1 and v3.15.2 cannot be selected since it will cause a version clash when auto-incrementing.
2. Create a branch from the version's tag, substituting the semver `patch` with `x` e.g. `git branch 3.15.x v3.15.3`
3. Pushes to this branch with the `fix:` commit message will increment the version and create the v3.15.4 release. using `feat:` will cause an error.

For a minor (or patch) release for an older major version: 
1. Determine which version needs the feature e.g. v2.3
   1. The most recent feat for the major version needs to be selected. e.g. v2.1 and v2.2 cannot be selected since it will cause a version clash when auto-incrementing.
2. Create a branch from the version's tag, substituting the semver `feat` with `x` e.g. `git branch 2.x.x v2.3.0`
3. pushes to this branch with the `feat:` or `fix:` commit message will increment the `minor` or `patch` versions respectively.
