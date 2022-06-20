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
USER 1001
COPY --chown=appuser:appuser package.json package-lock.json ./
RUN npm i
COPY --chown=appuser:appuser tsconfig.json babel.config.js webpack.config.js .eslintrc.js ./
COPY --chown=appuser:appuser ./src ./src/
RUN npm run prisma:generate
RUN npm run build:prod


FROM dependencies AS runner
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
CMD ["npm", "run", "start:prod"]
