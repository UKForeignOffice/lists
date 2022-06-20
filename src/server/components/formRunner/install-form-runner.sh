# #!/bin/bash

# root_folder=$(pwd)
# form_runner_folder="$root_folder/lib/form-runner"
# lists_forms_overrides_folder="$root_folder/src/server/components/formRunner"

# form_runner_forms_folder="$form_runner_folder/runner/dist/server/forms"
# form_runner_views_folder="$form_runner_folder/runner/dist/server/views"
# form_runner_config_folder="$form_runner_folder/runner/config"
# form_runner_env_file="$form_runner_folder/runner/.env"

# forms_json_folder="$lists_forms_overrides_folder/forms-json"
# forms_views_folder="$lists_forms_overrides_folder/views"
# forms_config_folder="$lists_forms_overrides_folder/config"
# machine_name=`hostname`

# #echo "Deleting root folder $form_runner_folder"
# #rm -rf $form_runner_folder

# if [ -n "$(ls -A "$form_runner_folder" 2>/dev/null)" ]
# then
#   echo "Form Runner Already Installed"
# else
#   echo "Installing Form Runner"
#   git clone --depth 1 --branch 3.25.5-rc.864 https://github.com/XGovFormBuilder/digital-form-builder.git $form_runner_folder
#   cd $form_runner_folder
#   yarn install
#   yarn run build:dependencies
#   yarn runner build

#   # cleanup
#   rm -rf ./designer
#   rm -rf ./docs
#   rm -rf ./smoke-tests
#   rm ./runner/dist/server/forms/*
#   echo "Form Runner Installed Successfully"
# fi

# cd $root_folder

# # prepare .env
# rm $form_runner_env_file
# touch $form_runner_env_file
# echo "PORT=3001" >> $form_runner_env_file
# echo "PRIVACY_POLICY_URL=''" >> $form_runner_env_file
# echo "FEEDBACK_LINK=mailto:digitalservicesfeedback@fco.gov.uk" >> $form_runner_env_file
# echo "LOG_LEVEL=error" >> $form_runner_env_file
# echo "SERVICE_URL=localhost:3001" >> $form_runner_env_file
# echo "ENFORCE_CSRF=false" >> $form_runner_env_file
# echo "LOG_PRETTY_PRINT=false" >> $form_runner_env_file


# if [ "$NODE_ENV" == "production" ]; then
#   echo "GTM_ID_1=GTM-N5V9Z7G" >> $form_runner_env_file
#   echo "GTM_ID_2=GTM-KM3NZSZ" >> $form_runner_env_file
# fi

# if test -f ".env"; then
#   sed -n '/^REDIS_HOST/p' .env >> $form_runner_env_file
#   sed -n '/^REDIS_PORT/p' .env >> $form_runner_env_file
#   sed -n '/^REDIS_TLS/p' .env >> $form_runner_env_file
#   sed -n '/^REDIS_PASSWORD/p' .env >> $form_runner_env_file
#   sed -n '/^sandbox/p' .env >> $form_runner_env_file
# fi

# echo "Form Runner .env Created Successfully"

# # copy forms jsons
# cp -a "$forms_json_folder/." $form_runner_forms_folder
# echo "Forms JSON Files Copied Successfully"

# cp -a "$forms_config_folder/." $form_runner_config_folder
# echo "Forms config file Copied Successfully"
# cat "$form_runner_config_folder/production.json"

# cp -a "$forms_views_folder/." $form_runner_views_folder
# echo "Forms views Files Copied Successfully"

