#!/bin/sh

. ~/bin/setup_node_env.sh

appname=${PWD##*/}

mocha test/tests.js \
	--NODE_APP_INSTANCE="$appname";
