# PocketBase backend (hooks + migrations)

This folder contains the PocketBase-side code that the Next.js app depends on:

- `pb_hooks/` – JS hooks: `/api/dsc/*` endpoints (backups, message contacts,
  expert-registration-config, case allocation save) and record validation
- `pb_migrations/` – schema migrations (cms_portals, communications/feedback,
  expert management fields, case signup defaults, …)

## Hosting later

PocketBase loads `pb_hooks` and `pb_migrations` **from its data directory**
(the folder passed to `--dir`, default `./pb_data`).

**Option A — self-contained (good for dev/staging):**

```bash
# download pocketbase for your OS from https://pocketbase.io/docs/ and then:
./pocketbase serve --dir=backend/pb
```

This uses `backend/pb` as the data directory, so the SQLite DB
(`pb_data.db`), `storage/`, `pb_backups/` and runtime uploads land inside it
(git-ignored). Hooks and migrations in this folder are picked up
automatically. Admin UI: http://127.0.0.1:8090/_/

**Option B — existing hosted PocketBase:**

Copy the *contents* of `pb_hooks/` and `pb_migrations/` into your hosted
instance's data directory (next to `pb_data.db`), then restart PocketBase.
Migrations run once on startup; hooks are reloaded per request.

Notes:

- Migrations are one-way snapshots; apply them in filename order and never
  edit an already-applied migration (add a new one instead).
- The Next.js app talks to this instance via `NEXT_PUBLIC_POCKETBASE_URL`
  (see `next.config.mjs`).
