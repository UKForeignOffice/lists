FROM node:14-alpine AS base
RUN mkdir -p /usr/src/app && \
    addgroup -g 1001 appuser && \
    adduser -S -u 1001 -G appuser appuser && \
    chown -R appuser:appuser /usr/src/app && \
    chmod -R +x  /usr/src/app && \
    apk update && \
    apk upgrade

FROM base AS dependencies
WORKDIR /usr/src/app
USER 1001
COPY package.json package-lock.json ./
RUN npm i
RUN cp package-lock.json package-lock-cache.json

FROM dependencies AS build
WORKDIR /usr/src/app
COPY tsconfig.json babel.config.js webpack.config.js .eslintrc.js ./
COPY docker/apply/forms-json ./docker/apply/forms-json
COPY ./src ./src/
ARG BUILD_MODE=${BUILD_MODE}
RUN npm run build:${BUILD_MODE}

FROM base AS prodBase

# as root, remove all unnecessary binaries
WORKDIR /usr/bin
USER root
RUN rm vi tee ldd iconv strings traceroute traceroute6 wc wget unzip less scanelf

# docker build --target main -t main --build-arg BUILD_MODE=ci .
FROM prodBase as main
USER 1001
WORKDIR /usr/dist/app

# copy neccesary files only
COPY package.json ./
COPY --from=build /usr/src/app/dist dist
COPY --from=build /usr/src/app/node_modules node_modules
COPY src/server/models/db/ src/server/models/db/


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
FROM prodBase AS scheduled
WORKDIR /usr/dist/scheduler
COPY --from=main /usr/dist/app/dist/scheduler ./dist/scheduler
COPY --from=build /usr/src/app/node_modules node_modules
COPY docker/scheduler/package.json ./package.json
