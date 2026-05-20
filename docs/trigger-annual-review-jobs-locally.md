# Trigger annual review jobs locally

Use this guide to run annual review processing in a local developer setup.

## What this guide does

- gives you admin access if needed
- helps you prepare a list for annual review testing
- runs batch and worker jobs manually
- explains how to follow through using annual review links

## Prerequisites

- local `lists` environment is running
- local database is available
- you can log in to `http://localhost:3000/login`

If your local build output is missing `dist/scheduler/*.js`, run a build first (for example `npm run build:prod`).

## 1) Log in to admin

Open:

```text
http://localhost:3000/login
```

If you cannot access admin-only pages after login, promote your user role in the local DB.

## 2) Set yourself as Administrator (if required)

Replace the email before running:

```sql
update "User"
set "jsonData" = jsonb_set("jsonData", '{roles}', to_jsonb(array['Administrator']), true)
where email = 'your@email';
```

## 3) Open the list development page

Use:

```text
http://localhost:3000/dashboard/lists/<list_id>/development
```

Replace `<list_id>` with the target list ID.

## 4) Prepare annual review test data

For the target list:

- set `nextAnnualReviewStartDate` to a date within the next four weeks
- ensure list items are eligible (published for at least one month)

The scheduler logic and eligibility details are documented in `repos/lists/docs/scheduler.md`.

## 5) Trigger the batch job manually

In a separate terminal (with app dependencies still running):

```bash
node dist/scheduler/batch.js
```

Expected outcome: the batch process creates/updates `currentAnnualReview` data for eligible lists.

## 6) Trigger the worker job manually

In another terminal:

```bash
node dist/scheduler/worker.js
```

Expected outcome: worker tasks process annual review milestones and send relevant emails.

## 7) Validate using annual review links from emails

Emails include links similar to:

```text
https://find-a-professional-service-abroad.service.forms.fcodev.org.uk/annual-review/confirm/3b39f992-abec-489a-808b-e1ea08c53d44
```

The GUID path segment is the list item reference and is unique per application.

## Quick verification checklist

- batch job completes without errors
- worker job completes without errors
- list/item state changes are visible in dashboard
- annual review confirmation links open correctly

## Related docs

- `repos/lists/docs/scheduler.md`
- `repos/lists/docs/local-instance-setup.md`
- `repos/lists/docs/database-data-update-guide.md`

