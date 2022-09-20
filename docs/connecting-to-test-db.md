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

To import the public key (pub.asc)
`% import pub.asc`

If you only have the b64 encoded key, to import the key
 `% $encoded_key | base64 --decode | gpg --import`

To encrypt the database
`% gpg -o test_data.sql.zip.gpg -r $key_fingerprint test_data.sql`
For the recipient `-r`, you may use the key's fingerprint, or the UID of the key. 

To find the key's fingerprint
`% gpg -k` will list all the public keys in your keychain. It will look something like this:
```
pub   rsa3072 2022-03-23 [SC]
      15E44D74231F2A6ED9981C78D9A575DB77C087CC # <- fingerprint
uid           [ultimate] CYBLists-23-03-22 #<- uid
sub   rsa3072 2022-03-23 [E]
```


