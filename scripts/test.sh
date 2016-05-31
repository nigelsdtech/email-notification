#!/bin/sh

. ~/bin/setup_node_env.sh

export NODE_APP_INSTANCE="email-notification-test"

mocha test
