ARG BASE_IMAGE_TAG="3.25.13-rc.872"
FROM ghcr.io/xgovformbuilder/digital-form-builder-runner:$BASE_IMAGE_TAG as base
WORKDIR /usr/src/app
RUN rm -r runner/dist/server/forms && rm -r runner/src && rm -r runner/test
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
ENV FEEDBACK_LINK="mailto:digitalservicesfeedback@fco.gov.uk"
CMD [ "yarn", "runner", "start"]
