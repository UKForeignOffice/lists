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
USER 1001
RUN mkdir -p /usr/src/app/lib/form-runner
COPY --from=ghcr.io/xgovformbuilder/digital-form-builder-runner:3.25.4-rc.863 ./usr/src/app lib/form-runner/
RUN cd lib/form-runner/runner/config && touch production.json && echo {} > production.json

FROM dependencies AS build
WORKDIR /usr/src/app
RUN npm i
COPY --chown=appuser:appuser ./src ./src/
USER 1001
RUN npm run prisma:generate
RUN npm run build:prod


FROM build AS runner
WORKDIR /usr/src/app
USER 1001
ARG NODE_ENV
ARG DOCKER_TAG
ENV NODE_ENV=$NODE_ENV
ENV DOCKER_TAG=$DOCKER_TAG
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
