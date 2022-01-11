#FROM postgis/postgis
FROM gangstead/postgis:13-3.1-arm

ENV POSTGRES_DB=service-finder-db
ENV POSTGRES_USER=postgresuser
ENV POSTGRES_PASSWORD=postgrespass

COPY dump-users.sql /docker-entrypoint-initdb.d/

CMD postgres -c config_file=/usr/src/config/postgresql-local.conf
