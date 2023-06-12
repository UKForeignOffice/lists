FROM node:18-alpine AS base
RUN mkdir -p /usr/src/app && \
    apk update && \
    apk upgrade

FROM base AS dependencies
WORKDIR /usr/src/app
# Node user provided by default with correct priviledges for noed packages
# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#non-root-user
COPY --chown=node package.json package-lock.json ./
RUN npm i
COPY --chown=node package-lock.json package-lock-cache.json


FROM dependencies AS build
WORKDIR /usr/src/app
COPY --chown=node tsconfig.json babel.config.js webpack.config.js .eslintrc.js ./
COPY --chown=node docker/apply/forms-json ./docker/apply/forms-json
COPY --from=dependencies /usr/src/app/node_modules node_modules
COPY ./src ./src/
ARG BUILD_MODE=${BUILD_MODE}
RUN npm run build:${BUILD_MODE}

FROM base AS prod
# as root, remove all unnecessary binaries for production
# use this stage as the "base" for production images
WORKDIR /usr/bin
USER root
RUN rm vi tee ldd iconv strings traceroute traceroute6 wc wget unzip less scanelf

# docker build --target main -t main --build-arg BUILD_MODE=ci .
FROM prod as main
USER node
WORKDIR /usr/dist/app

# copy neccesary files only
COPY --chown=node package.json ./
COPY --chown=node --from=build /usr/src/app/dist dist
COPY --chown=node --from=build /usr/src/app/node_modules node_modules
COPY --chown=node src/server/models/db/ src/server/models/db/


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

# docker build --target scheduled -t scheduled --build-arg BUILD_MODE=ci .
FROM prod AS scheduled
USER node
WORKDIR /usr/dist/scheduler
COPY --chown=node --from=main /usr/dist/app/dist/scheduler ./dist/scheduler
COPY --chown=node --from=build /usr/src/app/node_modules node_modules
COPY --chown=node docker/scheduler/package.json ./package.json
