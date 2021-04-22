#!/bin/bash

root_folder=$(pwd)
form_runner_folder=./src/form-runner/form-runner-app
form_runner_forms_folder="$form_runner_folder/runner/dist/server/forms"
forms_json_folder=./src/form-runner/forms-json

if [ -d $form_runner_folder ]
then
  echo "Form Runner Already Installed"
else
  echo "Installing Form Runner"
  git clone --depth 1 --branch 1.0.30-rc https://github.com/XGovFormBuilder/digital-form-builder.git $form_runner_folder
  cd $form_runner_folder
  yarn install
  yarn run build:dependencies
  yarn runner build

  # prepare .env
  echo "PORT=3001" >> ./runner/.env
  echo "PRIVACY_POLICY_URL=https://www.gov.uk/help/privacy-notice" >> ./runner/.env
  echo "SERVICE_NAME=Find a Professional Service Abroad" >> ./runner/.env
  echo "FEEDBACK_LINK=mailto:digitalservicesfeedback@fco.gov.uk" >> ./runner/.env
  echo "LOG_LEVEL=error" >> ./runner/.env

  # cleanup
  rm -rf ./designer
  rm -rf ./docs
  rm -rf ./smoke-tests

  echo "Form Runner Installed Successfully"
fi

cd $root_folder

# copy forms jsons
rm -rfv "$form_runner_forms_folder/*" 
cp -a "$forms_json_folder/." $form_runner_forms_folder
echo "Forms JSON Files Copied Successfully"
 