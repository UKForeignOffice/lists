#!/bin/bash
if [ -n "${ENVIRONMENT:-}" ]; then
  find runner/dist/server/forms -type f -exec sed -i "s|http://lists|http://lists.$ENVIRONMENT.internal|g" {} +
  sed -i "s|lists|lists.$ENVIRONMENT.internal|g" runner/config/$NODE_ENV.json
fi
yarn runner start
