# Local instance setup (developer guide)

Use this guide to get a local Lists instance running quickly.

## What this guide covers

- Running dependencies in Docker
- Running `lists` locally for code changes
- Updating form webhook targets for local ingest
- Access URLs for apply and list management
- Granting yourself admin access if login succeeds but dashboard access is missing

## Recommended workflow (hybrid)

This is the best option when you are actively changing the `lists` service.

### 1) Start Docker services (without `lists`)

```bash
docker compose up --build postgres redis apply
```

### 2) Authenticate to AWS in a separate terminal

You need AWS auth for features that call AWS services (for example AWS Location).
Use your team-standard auth helper flow before running `lists` locally.

### 3) Start `lists` locally

```bash
npm run dev
```

## Alternative workflow (all in Docker)

Use this when you want everything containerised and do not need local hot-reload for `lists` code changes.

```bash
docker compose up --build postgres redis apply lists
```

## Configure form webhooks for local ingest

When `lists` runs locally (hybrid mode), update the form webhook output URL:

- from: `http://lists:3000/ingest/<serviceType>`
- to: `http://host.docker.internal:3000/ingest/<serviceType>`

Without this change, the form runner container will post to the Docker network host instead of your locally running app.

## Local URLs

- Apply form runner: `http://localhost:3001/<form-name>`
  - example: `http://localhost:3001/funeral-directors`
- Lists login: `http://localhost:3000/login`

## If login works but admin access is missing

If you can sign in but cannot access admin-only pages, your user likely does not have the `Administrator` role in the `User.jsonData.roles` field.

Expected roles JSON:

```json
{"roles": ["Administrator"]}
```

### Promote a user to Administrator (PostgreSQL)

Replace `<email>` with your user email.

```sql
update "User"
set "jsonData" = jsonb_set("jsonData", '{roles}', to_jsonb(array['Administrator']), true)
where email = '<email>';
```

Example:

```sql
update "User"
set "jsonData" = jsonb_set("jsonData", '{roles}', to_jsonb(array['Administrator']), true)
where email = 'your@email';
```

## Troubleshooting tips

- If apply submissions do not appear in `lists`, re-check webhook target host.
- If geolocation calls fail locally, verify AWS auth is active in the terminal running `npm run dev`.
- If login/session behavior is unexpected, confirm Redis and Postgres are healthy in Docker.

