#!/bin/sh 

#echo "Setting environment variables..."

export PORT=1234
echo PORT=$PORT

export ROOT_URL=http://localhost:$PORT/databet
echo ROOT_URL=$ROOT_URL

# For the non-local running of node
#export METEOR_SETTINGS=$(cat ../config/settings.real.json)
#echo METEOR_SETTINGS=$METEOR_SETTINGS

export UPLOAD_DIR=`pwd`/UploadedFiles
echo UPLOAD_DIR=$UPLOAD_DIR

#SETTINGS_FILE=../config/settings.real.json
SETTINGS_FILE=../config/settings.development.json

meteor --settings=$SETTINGS_FILE  --port $PORT --no-release-check


