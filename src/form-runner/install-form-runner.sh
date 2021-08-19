#!/bin/bash

root_folder=$(pwd)
form_runner_folder="$root_folder/lib/form-runner"
form_runner_forms_folder="$form_runner_folder/runner/dist/server/forms"
form_runner_env_file="$form_runner_folder/runner/.env"
forms_json_folder=./src/form-runner/forms-json

# rm -rf ./lib

if [ -n "$(ls -A "$form_runner_folder/node_modules/.bin" 2>/dev/null)" ]
then
  echo "Form Runner Already Installed"
else
  echo "Installing Form Runner"
  git clone --depth 1 --branch 3.9.10-rc.784 https://github.com/XGovFormBuilder/digital-form-builder.git $form_runner_folder
  cd $form_runner_folder
  yarn install
  yarn run build:dependencies
  yarn runner build
  
  # cleanup
  rm -rf ./designer
  rm -rf ./docs
  rm -rf ./smoke-tests
  rm ./runner/src/server/forms/*
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
if [ "$NODE_ENV" == "production" ]; then
  echo "GTM_ID_1=GTM-KZWHG2G" >> $form_runner_env_file
  echo "GTM_ID_2=GTM-PCZSN93" >> $form_runner_env_file
fi

if test -f ".env"; then
  sed -n '/^REDIS_HOST/p' .env >> $form_runner_env_file
  sed -n '/^REDIS_PORT/p' .env >> $form_runner_env_file
  sed -n '/^REDIS_TLS/p' .env >> $form_runner_env_file
  sed -n '/^REDIS_PASSWORD/p' .env >> $form_runner_env_file
  sed -n '/^sandbox/p' .env >> $form_runner_env_file
fi

echo "Form Runner .env Created Successfully"

# copy forms jsons
cp -a "$forms_json_folder/." $form_runner_forms_folder
echo "Forms JSON Files Copied Successfully"
 