# Steps to update the dev db with prod data

## Pre-requisites

- Login details for the FCDO AWS configuration https://github.com/UKForeignOffice/configurable-forms-infrastructure#kubectl-client-configuration
- Connected to the VPN and authenticated. See [connecting to the test db](https://github.com/UKForeignOffice/lists/blob/master/docs/connecting-to-test-db.md#connecting-to-test-environment-database) for more details
- Set your context to `fco-forms-prod`. `% kubectx fco-forms-prod`
- postgres running on your machine locally
  - `% docker compose up postgres`

## 1 - Get a dump of data from production and export to a file

Get a dump of the data from the production environment and export it to a file. This file will contain all of the data that is currently in the production database.

You will first have to use **kubectl** to get the list of available pods `kubectl get pod`
Locate the one with the prefix `lists-postgres- `

Them access the shell of that pod with the following command:

```bash
kubectl exec -it lists-postgres-[pod_id]
```

_Replace [pod_id] with the relevant id, eg `764c9b5879-5mf5f`_

Now you can run the following command:

```bash
pg_dump -U master -h lists-postgres:5432 -Fc lists > prod_dump.dump
```

## 2 - Load the Dump into a Local Development Database

Once you have the dump file, load it into a local development database so you can make changes without affecting the production environment.

Here's an example of how to load a Postgres dump file into a local development database:

```bash
psql -U master -h localhost -d lists < prod_data.sql
```

## 3 - Update Emails on All Lists in Local Dev Database

Use the script below to replace production emails with this development one:

```sql
BEGIN;
UPDATE List
SET jsonData = jsonb_set(jsonData,'{users}', '["list-management@cautionyourblast.com"]')
WHERE ("jsonData"->'users')::jsonb is not null;
COMMIT;

```

## 4 - Create encrypted export to commit to repository

Get another dump of the data from the local development database to create a new dump file that includes your changes then Encrypt the dump file using GPG.

You can do that with the following command

```bash
pg_dump postgresql://master:[password]@localhost:5432/lists | gpg -e -o updated_prod_data.sql.zip.gpg -r [recipient_id]
```

See [connecting-to-test-db.md#snapshot](https://github.com/UKForeignOffice/lists/blob/master/docs/connecting-to-test-db.md#snapshot) on how to decrypt and encrypt the database using GPG.

[GPG Documentation](https://www.gnupg.org/documentation/index.html)

## 5 - Reference in DB Container

In the Lists application navigate to `docker/db` and replace the existing sql.zip.gpg file with the newly encrypted one.

Open the Dockerfile in that same directory and replace the end of the line that starts `RUN cd /docker-entrypoint-initdb.d...` with the new encrypted dump file.
