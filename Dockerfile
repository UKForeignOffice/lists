# if you are on Mac M1 please add --platform=linux/amd64 after FROM below
FROM node:14.21-alpine3.13 AS base
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
USER 1001
COPY package.json package-lock.json ./
RUN npm i
COPY tsconfig.json babel.config.js webpack.config.js .eslintrc.js ./
COPY docker/apply/forms-json ./docker/apply/forms-json
COPY --chown=appuser:appuser ./src ./src/


FROM dependencies AS build
WORKDIR /usr/src/app
ARG BUILD_MODE=${BUILD_MODE}
RUN npm run build:${BUILD_MODE}

# docker build --target main -t main --build-arg BUILD_MODE=ci .
FROM build AS main
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
ENV DEBUG=true
ENV CI_SMOKE_TEST=true

CMD ["npm", "run", "start:prod"]

# docker build --target main -t scheduled --build-arg BUILD_MODE=ci .
# if you are on Mac M1 please add --platform=linux/amd64 after FROM below
FROM node:14.21-alpine3.13 AS scheduled
WORKDIR /usr/src/scheduler
COPY --from=main /usr/src/app/dist ./dist/
COPY --from=main /usr/src/app/node_modules ./node_modules/
COPY --from=main /usr/src/app/docker/apply/forms-json ./docker/apply/forms-json/
COPY --from=main /usr/src/app/src/server/models/db/schema.prisma ./src/server/models/db/
COPY --from=main /usr/src/app/src/server/models/db/migrations ./src/server/models/db/migrations
COPY docker/scheduler/package.json ./package.json
