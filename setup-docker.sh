#!/bin/bash

set -e  # Bail if something fails

# Create the .env file
echo 'Creating docker .env file (this may take a minute)'
./lib/killrvideo-docker-common/create-environment.sh

# Load the .env file we just created so we have access to variables
source ./.env

# Create the loopback aliases for the two IPs in the .env file
echo
echo 'We need to create two aliases for the loopback adapter using sudo'
echo 'You will be prompted for your password'
sudo ifconfig lo0 alias $KILLRVIDEO_HOST_IP
sudo ifconfig lo0 alias $KILLRVIDEO_DOCKER_IP

echo
echo 'Pulling all docker dependencies' 

# Pull all docker dependencies
docker-compose pull

echo
echo "You can now start docker dependencies with 'docker-compose up -d'"
