#!/bin/bash

root_folder=$(pwd)
form_runner_folder=./lib/form-runner
form_runner_forms_folder="$form_runner_folder/runner/dist/server/forms"
form_runner_env_file="$form_runner_folder/runner/.env"
forms_json_folder=./src/form-runner/forms-json

# rm -rf $form_runner_folder

if [ -d "$form_runner_folder/node_modules" ]
then
  echo "Form Runner Already Installed"
else
  echo "Installing Form Runner"
  git clone --depth 1 --branch 2.0.65-rc https://github.com/XGovFormBuilder/digital-form-builder.git $form_runner_folder
  cd $form_runner_folder
  yarn install
  yarn run build:dependencies
  
  # cleanup
  rm -rf ./designer
  rm -rf ./docs
  rm -rf ./smoke-tests
  rm ./runner/src/server/forms/*

  # build
  yarn runner build
  echo "Form Runner Installed Successfully"
fi

cd $root_folder

# prepare .env
rm $form_runner_env_file
touch $form_runner_env_file
echo "PORT=3001" >> $form_runner_env_file
echo "PRIVACY_POLICY_URL=https://www.gov.uk/help/privacy-notice" >> $form_runner_env_file
echo "FEEDBACK_LINK=mailto:digitalservicesfeedback@fco.gov.uk" >> $form_runner_env_file
echo "LOG_LEVEL=error" >> $form_runner_env_file
echo "Form Runner .env Created Successfully"

# copy forms jsons
cp -a "$forms_json_folder/." $form_runner_forms_folder
echo "Forms JSON Files Copied Successfully"
 