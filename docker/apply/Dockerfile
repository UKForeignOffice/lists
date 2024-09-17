ARG BASE_IMAGE_TAG="3.32.1-rc.9"
FROM ghcr.io/xgovformbuilder/digital-form-builder-runner:$BASE_IMAGE_TAG AS base
WORKDIR /usr/src/app
RUN rm -r runner/dist/server/forms && rm -r runner/src
COPY forms-json runner/dist/server/forms
COPY views/ runner/dist/server/views/
COPY config/ runner/config
COPY docker-entrypoint.sh /usr/src/app/docker-entrypoint.sh
USER root
EXPOSE 3001
ENV PORT=3001
ENV SERVICE_URL="apply:${PORT}"
ENV SANDBOX="false"
ENV LOG_PRETTY_PRINT="false"
ENV FEEDBACK_LINK="https://www.smartsurvey.co.uk/s/Apply-to-Find-a-Professional/"
CMD ["/usr/src/app/docker-entrypoint.sh"]
