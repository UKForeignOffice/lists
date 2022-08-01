FROM postgis/postgis
#FROM gangstead/postgis:13-3.1-arm

ARG PGP_SECRET="NO PGP SECRET KEY SET"
ARG PGP_PUB="NO PGP PUBLIC KEY SET"
ARG PGP_OTRUST="NO PGP OWNER TRUST DB SET"



ENV POSTGRES_USER="master"
ENV POSTGRES_DB=lists
ENV POSTGRES_USER=master
ENV POSTGRES_PASSWORD=postgrespass

COPY test_data.sql.zip.gpg /docker-entrypoint-initdb.d/
COPY postgresql-local.conf postgresql-local.conf
COPY scripts/ /scripts

RUN echo $PGP_SECRET | base64 --decode | gpg --import && \
    echo $PGP_PUB | base64 --decode | gpg --import && \
    echo $PGP_OTRUST | gpg --import-ownertrust

### If you are unable to decrypt these files, you may have an invalid or outdated key and need to regenerate them.
RUN cd /docker-entrypoint-initdb.d && gpg -o test_data.sql -d test_data.sql.zip.gpg

CMD docker-entrypoint.sh -c 'shared_buffers=256MB' -c 'max_connections=200' -c config_file=postgresql-local.conf

