# Getting started

You will need to be running the version of NodeJS set in the `.nvmrc` file in the root of the repository and `Yarn` package manager.

You can quickly install Yarn by running `npm i -g yarn`. If you are running multiple versions of Node on your machine you will need to make sure you install Yarn on the specific version Node you are using as the installation will not jump between different versions of NodeJS.

Whilst the List application uses `npm` as its package manager, the Form Runner application uses `Yarn`, which is why you need to have it installed.

## Installation

Once you have cloned the repo, run `npm ci` to install the required dependencies.

Next you will need to install the Form Runner. You can do that by running `npm run form-runner:install`. The form runner will be cloned into the `lib` folder - this folder should never be committed into the repo.

## Config

You will need to set up your `.env` file to contain the correct values. Below is an empty example that you will need to fill in.

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

## Portable environment

In order to speed up development, a portable environment is provided to get you up and running without needing to install various database servers and other infrastructure. You will need to ensure you have `Docker` installed on your machine.

To start up the environment, simply run `npm run environment`. You should do this on a secondary terminal window or tab.

## Running the application

You will need to be connected to the VPN in order to start up the application.

You will also need to source the `aws_helper_cyb.sh` script from the `configuarable-forms-infrastructure` repo in order to authenticate yourself as the application will need to access resources on AWS.

The first time you start the application you will also need to initiate the database schema.

```bash
$ npm run prisma:generate
$ npm run prisma:deploy
```

You should not have to run this again after the first time unless database schema changes have been made or a new migration generated.

With the environment set up and the database ready to go, you just need to run the following to get the application up and running.

```bash
$ formsawsauth formsprod # You will need to enter you 2FA code
$ npm run dev
```

The application will start up on `localhost:3000`.
