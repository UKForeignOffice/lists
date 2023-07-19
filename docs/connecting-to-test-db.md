# Connecting to test environment database

In order to connect to the test environment database you will need to be connected to the VPN. You will also need to source the `aws_helper_cyb.sh` script from the [UKForeignOffice/configurable-forms-infrastructure](https://github.com/UKForeignOffice/configurable-forms-infrastructure) repo and have `Kubernetes` and `Kubectl` installed.

Please make sure you have your **username** and **password** set up and to hand, without these you will not be able to access the server.

```shell
$ source ../configurable-forms-infrastructure/scripts/aws_helper.sh # or source aws_helper.sh
$ formsawsauth prod # You will need to enter you 2FA code
```

Once you're in, run this command to see the list of available pods:

```bash
$  kubectl get pods
```

You should see one that contains the following text `lists-postgres`. This is the one you want.

```bash
$ kubectl exec -it lists-postgres-${POD_ID} -- psql postgresql://${postgres_username}:{$postgres_password}@lists-postgres:5432/lists
```

Once you are connected, you will be presented with the PostgreSQL Interactive Terminal. You can find documentation on `psql` at: https://www.postgresql.org/docs/13/app-psql.html

_NOTE: if the above steps don't work you might have to update the kube config. You can do so with the below command:_

```bash
 $ aws eks update-kubeconfig --region eu-west-2 --name ${EKS_CLUSTER_NAME}
```

---

# Snapshot

You may also use a snapshot of the test database (taken on 10/1/2021) and run the database locally with docker.
You must have access to `keybase://team/cautionyourblast.fcdo/config` to access the PGP secret key which can decrypt [docker/db/test_data.sql.zip.gpg](./../docker/db/test_data.sql.zip.gpg).

## Prerequisites

- access to `keybase://team/cautionyourblast.fcdo/config`
- GPG tool such as [gnupg](https://formulae.brew.sh/formula/gnupg)

## Decrypting and using the database

1. Go to [keybase://team/cautionyourblast.fcdo/config/dev/lists/pgp](keybase://team/cautionyourblast.fcdo/config/dev/lists/pgp) which is a base64 encoded string of the armoured key.
   You may also download these file if you do not have the keybase volumes/file system set up on your machine.
   The keys are stored in base64 so that they can be easily copied to a ci platform.
2. Import the keys
   1. If you do not have keybase volumes set up, you need to download these files.
   2. The Dockerfile requires PGP_PUB, PGP_SECRET and PGP_OTRUST to be passed as build arguments (`--build-arg`). You may set these in your .env file for easy access.
      - `docker compose -f docker-compose.ci.yml build --build-arg PGP_PUB=$(cat pub.asc) --build-arg PGP_PUB=$(cat secret.asc) PGP_OTRUST=$(cat otrust.txt)`
      - or
        1. `% echo 'PGP_SECRET='$(cat secret.asc) >> .env && echo 'PGP_PUB='$(cat pub.asc) >> .env && echo 'PGP_OTRUST='$(cat otrust.txt) >> .env`
        2. `docker compose -f docker-compose.ci.yml build --build-arg PGP_PUB=$(PGP_PUB) --build-arg PGP_SECRET=$(PGP_SECRET) PGP_OTRUST=$(PGP_OTRUST)`
   - alternatively, if you want to encrypt or decrypting these files locally it would be easier to import the keys to your gnupg keyring `% cat secret.asc | base64 --decode | gpg --import`
3. Build the image `docker compose --build`
4. Run the container(s) `docker compose up`

## Encrypting the database

You must have gnupg (gpg) installed with at least the public key imported into your keychain.

1. `cat pub.asc | base64 --decode | gpg --import`
2. encrypt the database `gpg -o test_data.sql.zip.gpg -r BC6D45323BC3CB12EAB271379A2CC0D6099DA303 test_data.sql`

Data needed to test the annual review process:

-- update email addresses for lists

```
update "List" set "jsonData" = jsonb_set("jsonData", '{administrators}'::text[], '["ali@cautionyourblast.com","ali.salaman@fcdo.gov.uk"]'::jsonb);
update "List" set "jsonData" = jsonb_set("jsonData", '{validators}'::text[], '["ali@cautionyourblast.com","ali.salaman@fcdo.gov.uk"]'::jsonb);
update "List" set "jsonData" = jsonb_set("jsonData", '{publishers}'::text[], '["ali@cautionyourblast.com","ali.salaman@fcdo.gov.uk"]'::jsonb);
```

-- update annual review dates for lists

```
update "List" set "nextAnnualReviewStartDate" = current_date + INTERVAL '1 month' where "id" = 150;
update "List" set "nextAnnualReviewStartDate" = current_date + INTERVAL '7 days' where "id" = 88;
update "List" set "nextAnnualReviewStartDate" = current_date + INTERVAL '1 day' where "id" = 240;
update "List" set "nextAnnualReviewStartDate" = current_date where "id" = 246;
```

-- update annual review dates for lists with upcoming annual review date

```
update "List" set "nextAnnualReviewStartDate" = current_date - INTERVAL '42 days' where "id" = 157;
update "List" set "nextAnnualReviewStartDate" = current_date - INTERVAL '41 days' where "id" = 151;
update "List" set "nextAnnualReviewStartDate" = current_date - INTERVAL '35 days' where "id" = 203;
update "List" set "nextAnnualReviewStartDate" = current_date - INTERVAL '28 days' where "id" = 216;
update "List" set "nextAnnualReviewStartDate" = current_date - INTERVAL '21 days' where "id" = 345;
update "List" set "nextAnnualReviewStartDate" = current_date - INTERVAL '14 days' where "id" = 162;
update "List" set "nextAnnualReviewStartDate" = current_date - INTERVAL '7 days' where "id" = 156;
```

-- update statuses for associated list ids

```
update "ListItem" set "status" = 'ANNUAL_REVIEW', "isAnnualReview" = true where id in (
  1546, 1825, 1774,
  1527, 1514, 1522,
  1002, 1094, 1101,
  1205, 1135, 1127,
  1017, 918, 955,
  1890, 900, 1847,
  847, 953, 802
);
```

-- diagnostics

```
select "id", "nextAnnualReviewStartDate", "lastAnnualReviewStartDate", "jsonData" ->> 'publishers'
from "List"
where "id" in (246,240,88,150, 157,151,203,216,345,162,156);

select "listId", "id", "type", "status", "isAnnualReview",
"jsonData" ->> 'organisationName' as "organisationName",
"jsonData" ->> 'emailAddress' as "emailAddress",
"jsonData" ->> 'publicEmailAddress' as "publicEmailAddress"
from "ListItem" where "listId" in (246,240,88,150, 157,151,203,216,345,162,156) order by "listId" desc;

```
