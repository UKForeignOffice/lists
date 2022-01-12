# Connecting to test environment database

In order to connect to the test environment database you will need to be connected to the VPN. You will also need to source the `aws_helper_cyb.sh` script from the [UKForeignOffice/configurable-forms-infrastructure](https://github.com/UKForeignOffice/configurable-forms-infrastructure) repo and have `Kubernetes` and `Kubectl` installed.

Please make sure you have your username and password set up and to hand, without these you will not be able to access the server.

```shell
$ formsawsauth formsprod # You will need to enter you 2FA code
$ kubectl run -it --rm --image=postgres:10 --restart=Never postgres-client -- psql -h DATABASE_SERVER_ADDRESS -U YOUR_USERNAME -d lists # Replace YOUR_USERNAME with your actual username and DATABASE_SERVER_ADDRESS with the URL to the database cluster
```

Once you are connected, you will be presented with the PostgreSQL Interactive Terminal. You can find documentation on `psql` at: https://www.postgresql.org/docs/13/app-psql.html

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
     * alternatively, if you want to encrypt or decrypting these files locally it would be easier to import the keys to your gnupg keyring `% cat secret.asc | base64 --decode | gpg --import`
3. Build the image `docker compose --build`
4. Run the container(s) `docker compose up`

## Encrypting the database

You must have gnupg (gpg) installed with at least the public key imported into your keychain.
1. `cat pub.asc | base64 --decode | gpg --import`
2. encrypt the database `gpg -o test_data.sql.zip.gpg -r BC6D45323BC3CB12EAB271379A2CC0D6099DA303 test_data.sql`
