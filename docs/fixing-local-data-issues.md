# Fixing local data issues

There is a chance that sometimes you'll mess up that data locally somehow.

The best way to fix that is to remove the docker container and start it up again which will reset the data.

Here are the steps to do that.

1. Make sure you stop the postgres related docker container:

```bash
docker stop lists-postgres-1
```

2. Then remove that container:

```bash
docker rm lists-postgres-1
```

3. Now run that container again with the docker compose command:

```bash
docker compose up postgres
```

4. Once that's going, in a new tab, make sure you run migrations on the lists app. To do so run this command:

```bash
npm run prisma:deploy
```

5. Now start the app:

```bash
npm run dev
```

You could also run prisma studio on the app to see if all the data is there

```bash
npm run prisma:studio
```
