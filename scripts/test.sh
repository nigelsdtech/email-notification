#!/bin/sh

. ~/bin/setup_node_env.sh

#appname=${PWD##*/}
#appname="email-notification"
#export NODE_APP_INSTANCE="${appname}"
export NODE_ENV="test"

mocha -b --check-leaks --recursive test
