#!/bin/sh

COMMON_DIR="lib/killrvideo-docker-common"
EXTRAS_DIR="$COMMON_DIR/extras"

docker-compose -f $COMMON_DIR/docker-compose.yaml -f docker-compose.yaml -f $EXTRAS_DIR/docker-compose-server.yaml down
