# Steps to update the dev db with prod data


## 1 - Take a Dump of Data from Production and Export to a File

You'll first need to take a dump of the data from the production environment and export it to a file. This file will contain all of the data that is currently in the production database.

You will first have to use **kubectl** to get the list of available pods `kubectl get pod`
Locate the one with the prefix `lists-postgres- `

The you'll have to access the shell of that pod with the following command:
```bash
kubectl exec -it lists-postgres-[pod_id]
```

_Replace [pod_id] with the reelevant id, eg `764c9b5879-5mf5f`_

Now you can run the following command:

```bash
pg_dump -U master -h lists-postgres:5432 -Fc lists > prod_dump.dump
```

## 2 - Load the Dump into a Local Development Database

Once you have the dump file, you'll need to load it into a local development database so you can make changes without affecting the production environment.

Here's an example of how to load a Postgres dump file into a local development database:

```bash
psql -U master -h localhost -d lists < prod_data.sql
```


## 3 - Update Emails on All Lists in Local Dev Database

Now that you have the data from the production database loaded into your local development database, you can make the necessary changes. In this case, you need to update the emails on all of the lists in the database.

The exact Postgres command to do this will depend on the schema of your database, but it might look something like this:

```sql
BEGIN;
UPDATE List
SET jsonData = jsonb_set(jsonData,'{users}', jsonb_build_array('list-management@cautionyourblast.com'))
WHERE ("jsonData"->'users')::jsonb is not null;
COMMIT;

```

### 3.a If dev data contains Ali's email

If the data contains an email in the user's part of the jsonData column that resembles **ali.salaman@fcdo.gov.uk** you can use the following script to replace it with the propper email:

```sql
BEGIN;
UPDATE List
SET jsonData = jsonb_set(jsonData,'{users}',  (jsondata->'users')::jsonb || '["list-management@cautionyourblast.com"]'::jsonb)
WHERE (jsonData->'users')::jsonb  ? 'ali.salaman@fcdo.gov.uk';
COMMIT;

BEGIN;
UPDATE List
SET jsonData = jsonb_set(jsonData,'{users}',(jsonData->'users') - 'ali.salaman@fcdo.gov.uk')
WHERE (jsonData->'users')::jsonb  ? 'ali.salaman@fcdo.gov.uk';
COMMIT;
```

## 4 - Take a Dump of Data from Local Dev Database

After you've made your changes, you'll want to take another dump of the data from the local development database to create a new dump file that includes your changes.

```bash
psql -U master -h localhost -d lists < updated_prod_data.sql
```

## 5 - Encrypt Dump File and Reference in DB Container

Finally, you'll want to encrypt the dump file and reference it in your database container.

```
gpg -e -o updated_prod_data.sql.zip.gpg -r [recipient_id] updated_prod_data.sql
```