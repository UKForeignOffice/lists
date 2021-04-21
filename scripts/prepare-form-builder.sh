#!/bin/bash
rm -rf src/forms/form-builder

root_folder=$(pwd)

if [ -d src/forms/form-builder ]
then
  echo "Form Builder is ready"
else
  echo "Preparing Form Builder"
  git clone --depth 1 --branch 1.0.30-rc git@github.com:XGovFormBuilder/digital-form-builder.git src/forms/form-builder
  cd src/forms/form-builder
  yarn install
  yarn run build:dependencies
  yarn runner build

  # prepare .env
  echo "PORT=3001" >> ./runner/.env
  echo "PRIVACY_POLICY_URL=https://www.gov.uk/help/privacy-notice" >> ./runner/.env
  echo "SERVICE_NAME=Find a Professional Service Abroad" >> ./runner/.env
  echo "FEEDBACK_LINK=mailto:digitalservicesfeedback@fco.gov.uk"

  # cleanup
  rm -rf ./designer

  echo "Form Builder is ready"
fi

cd $root_folder

# copy forms json
rm -rfv ./src/forms/form-builder/runner/dist/server/forms/*
cp -a ./src/forms/forms-json/. ./src/forms/form-builder/runner/dist/server/forms