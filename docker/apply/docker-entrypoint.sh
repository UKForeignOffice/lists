#!/bin/bash
find runner/dist/server/forms -type f -exec sed -i "s|http://lists|http://lists.$ENVIRONMENT.internal|g" {} +
yarn runner start
