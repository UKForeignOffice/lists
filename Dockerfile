FROM node:15.13.0-alpine3.13 AS base
RUN mkdir -p /usr/src/app && \
    addgroup -g 1001 appuser && \
    adduser -S -u 1001 -G appuser appuser && \
    chown -R appuser:appuser /usr/src/app && \
    chmod -R +x  /usr/src/app && \
    apk update && \
    apk upgrade && \
    apk add --no-cache bash git

FROM base AS dependencies
WORKDIR /usr/src/app
COPY --chown=appuser:appuser package.json tsconfig.json .babelrc.js nodemon.json  ./
USER 1001
RUN npm install

FROM dependencies AS build
WORKDIR /usr/src/app
COPY --chown=appuser:appuser ./src ./src/
USER 1001
RUN npm run build


FROM build AS runner
WORKDIR /usr/src/app
USER 1001
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
