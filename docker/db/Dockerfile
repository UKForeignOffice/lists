FROM postgis/postgis
# If you are using an ARM device (e.g. Apple Silicon M1, M2), use the following line instead
#FROM gangstead/postgis:13-3.1-arm

# These secrets are stored in keybase://team/cautionyourblast.fcdo/config/dev/lists/pgp.
# You can replace the next 3 lines with the contents of keybase://team/cautionyourblast.fcdo/config/dev/lists/pgp/copy_into_docker.txt
# Or load the environment variables into your shell.


ARG PGP_SECRET="NO PGP SECRET KEY SET"
ARG PGP_PUB="NO PGP PUBLIC KEY SET"
ARG PGP_OTRUST="NO PGP OWNER TRUST DB SET"

ENV POSTGRES_USER="master"
ENV POSTGRES_DB=lists
ENV POSTGRES_USER=master
ENV POSTGRES_PASSWORD=postgrespass
ENV PGP_SECRET=$PGP_SECRET
ENV PGP_PUB=$PGP_PUB
ENV PGP_OTRUST=$PGP_OTRUST

COPY test_data.sql.zip.gpg /docker-entrypoint-initdb.d/
COPY postgresql-local.conf postgresql-local.conf
COPY scripts/ /docker-entrypoint-initdb.d

RUN echo $PGP_SECRET | base64 --decode | gpg --import && \
    echo $PGP_PUB | base64 --decode | gpg --import && \
    echo $PGP_OTRUST | gpg --import-ownertrust

### If you are unable to decrypt these files, you may have an invalid or outdated key and need to regenerate them
### You can also comment out the following line to skip  test data
RUN cd /docker-entrypoint-initdb.d && gpg -o 00-test_data.sql -d test_data.sql.zip.gpg

CMD docker-entrypoint.sh -c 'shared_buffers=256MB' -c 'max_connections=200' -c config_file=postgresql-local.conf

