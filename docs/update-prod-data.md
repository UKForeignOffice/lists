# Steps to update the dev db with prod data


## 1 - Take a Dump of Data from Production and Export to a File

Take a dump of the data from the production environment and export it to a file. This file will contain all of the data that is currently in the production database.

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

## 4 - Take a Dump of Data from Local Dev Database

Take another dump of the data from the local development database to create a new dump file that includes your changes.

```bash
psql -U master -h localhost -d lists < updated_prod_data.sql
```

## 5 - Encrypt Dump File and Reference in DB Container

Finally, encrypt the dump file and reference it in your database container.

```
gpg -e -o updated_prod_data.sql.zip.gpg -r [recipient_id] updated_prod_data.sql
```

[GPG Documentation](https://www.gnupg.org/documentation/index.html)