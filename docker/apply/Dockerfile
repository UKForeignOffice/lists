ARG BASE_IMAGE_TAG="3.25.59-rc.918"
FROM ghcr.io/xgovformbuilder/digital-form-builder-runner:$BASE_IMAGE_TAG as base
WORKDIR /usr/src/app
RUN rm -r runner/dist/server/forms && rm -r runner/src
COPY forms-json runner/dist/server/forms
COPY views/ runner/dist/server/views/
COPY config/ runner/config


FROM base as app
WORKDIR /usr/src/app
USER root
RUN deluser --remove-home appuser && \
 addgroup -g 1001 appuser && \
 adduser -S -u 1001 -G appuser appuser
USER appuser

EXPOSE 3001

USER 1001
ENV PORT=3001
ENV SERVICE_URL="apply:${PORT}"
ENV SANDBOX="false"
ENV LOG_PRETTY_PRINT="false"
ENV FEEDBACK_LINK="https://www.smartsurvey.co.uk/s/Apply-to-Find-a-Professional/"
CMD [ "yarn", "runner", "start"]
