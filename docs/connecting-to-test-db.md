# Connecting to test environment database

In order to connect to the test environment database you will need to be connected to the VPN. You will also need to source the `aws_helper_cyb.sh` script from the [UKForeignOffice/configurable-forms-infrastructure](https://github.com/UKForeignOffice/configurable-forms-infrastructure) repo and have `Kubernetes` and `Kubectl` installed.

Please make sure you have your username and password set up and to hand, without these you will not be able to access the server.

```shell
$ formsawsauth formsprod # You will need to enter you 2FA code
$ kubectl run -it --rm --image=postgres:10 --restart=Never postgres-client -- psql -h DATABASE_SERVER_ADDRESS -U YOUR_USERNAME -d lists # Replace YOUR_USERNAME with your actual username and DATABASE_SERVER_ADDRESS with the URL to the database cluster
```

Once you are connected, you will be presented with the PostgreSQL Interactive Terminal. You can find documentation on `psql` at: https://www.postgresql.org/docs/13/app-psql.html
