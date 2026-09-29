#!/bin/sh

# Do not start the application if migrations fail.
set -e

# Apply pending migrations before accepting requests.
node ./node_modules/prisma/build/index.js migrate deploy --schema ./src/server/models/db/schema.prisma

# Replace the shell so the application receives container signals directly.
exec node --trace-warnings ./dist/server.js