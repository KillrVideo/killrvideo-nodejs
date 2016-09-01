#!/bin/bash

set -e  # Bail if something fails

# Create the .env file
(exec ./lib/killrvideo-docker-common/create-environment.sh)

echo
echo Pulling all docker dependencies 

# Pull all docker dependencies
docker-compose pull

echo
echo You can now start docker dependencies with \'docker-compose up -d\'
