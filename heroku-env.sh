#!/bin/zsh

# Check if the correct number of arguments is provided
if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <app-name> <env-file>"
  exit 1
fi

APP_NAME=$1
ENV_FILE=$2


# Set environment variables from .env file
while read -r line || [[ -n "$line" ]]; do
  if [[ $line != \#* ]] && [[ -n $line ]]; then
      # Remove surrounding quotes if they exist
    key=$(echo $line | cut -d '=' -f 1)
    value=$(echo $line | cut -d '=' -f 2- | sed -e 's/^["'\'']//;s/["'\'']$//')
    heroku config:set $line --app c$APP_NAME
  fi
done < $ENV_FILE
