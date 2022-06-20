FROM node:14.17-alpine3.13 AS base
RUN mkdir -p /usr/src/app && \
    addgroup -g 1001 appuser && \
    adduser -S -u 1001 -G appuser appuser && \
    chown -R appuser:appuser /usr/src/app && \
    chmod -R +x  /usr/src/app && \
    apk update && \
    apk upgrade && \
    apk add --no-cache bash git curl


FROM base AS dependencies
WORKDIR /usr/src/app
COPY --chown=appuser:appuser package.json package-lock.json tsconfig.json babel.config.js webpack.config.js  ./
# USER 1001
# RUN mkdir -p /usr/src/app/lib/form-runner
# COPY --chown=appuser:appuser --from=ghcr.io/xgovformbuilder/digital-form-builder-runner:3.25.5-rc.864 ./usr/src/app lib/form-runner/
# COPY --chown=appuser:appuser ./src/server/components/formRunner/config lib/form-runner/runner/config
# COPY --chown=appuser:appuser ./src/server/components/formRunner/views lib/form-runner/runner/dist/server/views/
# COPY --chown=appuser:appuser ./src/server/components/formRunner/forms-json lib/form-runner/runner/dist/server/forms/

FROM dependencies AS build
WORKDIR /usr/src/app
USER 1001
RUN npm i
COPY --chown=appuser:appuser ./src ./src/
RUN npm run prisma:generate
RUN npm run build:prod


FROM build AS runner
WORKDIR /usr/src/app
USER 1001
ARG NODE_ENV
ARG DOCKER_TAG
ENV NODE_ENV=$NODE_ENV
ENV DOCKER_TAG=$DOCKER_TAG
ENV PORT=3000
ENV REDIS_HOST="redis"
ENV REDIS_PORT=6379
ENV REDIS_PASSWORD="redispassword"
ENV REDIS_CLUSTER_MODE=false
ENV FORM_RUNNER_URL=""

HEALTHCHECK CMD curl --fail http://localhost:${PORT}/ || exit 1

CMD ["npm", "run", "start:prod"]
