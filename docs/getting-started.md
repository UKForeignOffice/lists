# Getting started

You will need to be running the version of NodeJS set in the `.nvmrc` file in the root of the repository and `Yarn` package manager.

You can quickly install Yarn by running `npm i -g yarn`. If you are running multiple versions of Node on your machine you will need to make sure you install Yarn on the specific version Node you are using as the installation will not jump between different versions of NodeJS.

Whilst the List application uses `npm` as its package manager, the Form Runner application uses `Yarn`, which is why you need to have it installed.

## Installation

Once you have cloned the repo, run `npm ci` to install the required dependencies.

Next you will need to install the Form Runner. You can do that by running `npm run form-runner:install`. The form runner will be cloned into the `lib` folder - this folder should never be committed into the repo.

## Config

1. You will need to set up your `.env` file to contain the correct values. Below is an empty example that you will need to fill in.

```
DEBUG=
LOG_LEVEL=
LOCAL_HOST=
SERVICE_NAME=
SERVICE_DOMAIN=
DATABASE_URL=
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
REDIS_TLS=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
LOCATION_SERVICE_INDEX_NAME=
GOVUK_NOTIFY_API_KEY=
GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID=
GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID=
GOVUK_NOTIFY_POST_NEW_PROFESSIONAL_APPLICATION_RECEIVED_TEMPLATE_ID=
GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID=
PRIVACY_POLICY_URL=
CYB_DEV=
GTM_ID_1=
GTM_ID_2=
sandbox=
```

2. You will need to update the following configs in the docker > db > Dockerfile as well.

```
ARG PGP_SECRET=
ARG PGP_PUB=
ARG PGP_OTRUST=
```

3. Finally, you'll need to change anything in the code that has `http://lists:` and replace it with `http://host.docker.internal`

**Please make sure you don't commit any of these changes.**

(Optional) If you have issues with the DB you might need to add the DATABASE_URL value from your .env file into the .env file inside src > server > db > models

## Portable environment

In order to speed up development, a portable environment is provided to get you up and running without needing to install various database servers and other infrastructure. You will need to ensure you have `Docker` installed on your machine.

To start up the environment, simply run `npm run environment`. You should do this on a secondary terminal window or tab.

## Running the application

You will need to be connected to the VPN in order to start up the application.

You will also need to source the `aws_helper_cyb.sh` script from the `configuarable-forms-infrastructure` repo in order to authenticate yourself as the application will need to access resources on AWS.

You'll alos need to have the aws-cli installed, make sure the it's version 2 or above. To check simply type `aws --version`

The first time you start the application you will also need to initiate the database schema.

```bash
$ npm run prisma:generate
$ npm run prisma:deploy
```

You should not have to run this again after the first time unless database schema changes have been made or a new migration generated.

In a different terminal tab you'll need to start the docker containers for the database, the applications forms server and the redis database:

```bash
$ docker compose up redis postgres apply
```

With the environment set up and the database ready to go, you just need to run the following to get the application up and running.

```bash
$ source ../configurable-forms-infrastructure/scripts/aws_helper.sh # or source aws_helper.sh
$ formsawsauth prod # You will need to enter you 2FA code for fcomaster
$ npm run dev
```

_Logging into AWS is also useful for the **Geolocation** services when a region is entered. This will make more sense when you start to use the app._

The application will start up on `localhost:3000`.

_NOTE: There is no index screen for the app so going to `localhost:3000` will show a "Page not found" error, visit `localhost:3000/login` instead._
