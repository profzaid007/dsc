# PocketBase backend (schema snapshot + hooks)

This folder contains the PocketBase-side code the Next.js app depends on:

- `pb_schema.json` – the canonical collections snapshot (PocketBase **v0.31.0**).
  Import it to create/replace the schema. This is the source of truth.
- `pb_hooks/` – JS hooks: `/api/dsc/*` endpoints (backups, message contacts,
  expert-registration-config, case allocation save) and record validation.
- `seed.mjs` – idempotent seed of lookups, roles, portals, settings and the
  first admin user.
- `import-schema.mjs` – imports `pb_schema.json` over the REST API.
- `pb_migrations_legacy/` – the previous hand-written partial migrations.
  **Superseded by `pb_schema.json`; not loaded by PocketBase.** Kept for history.

## Deploy (PocketBase v0.31.0)

PocketBase loads `pb_hooks` and `pb_migrations` from its data directory (the
folder passed to `--dir`, default `./pb_data`).

1. Put `pb_hooks/` next to your data directory (or copy its contents there).
   Do **not** copy `pb_migrations_legacy/` into a `pb_migrations/` folder.

2. Apply the schema. Either:

   **API (recommended):**

   ```bash
   PB_URL=https://backend-dev.dsc.ac \
   PB_SUPERUSER_EMAIL=you@example.com PB_SUPERUSER_PASSWORD='…' \
   node backend/pb/import-schema.mjs
   ```

   **Dashboard:** Settings → Import collections → paste `pb_schema.json`.

   > `deleteMissing` replaces the whole non-system schema and drops records of
   > collections/fields absent from the snapshot. Back up first if you care
   > about existing data.

3. Seed defaults + first admin:

   ```bash
   PB_URL=https://backend-dev.dsc.ac \
   PB_SUPERUSER_EMAIL=you@example.com PB_SUPERUSER_PASSWORD='…' \
   APP_ADMIN_EMAIL=admin@dsc.local APP_ADMIN_PASSWORD='ChangeMe123!' \
   node backend/pb/seed.mjs
   ```

   Log in to the app with `APP_ADMIN_EMAIL` / `APP_ADMIN_PASSWORD` and change
   the password. The seeded admin has `role=super_admin`, `is_active=true`.

4. Restart PocketBase so `pb_hooks/` is loaded. Admin UI:
   `https://<host>/_/`.

## Local development

```bash
# download pocketbase v0.31.0 for your OS, then:
./pocketbase serve --dir=backend/pb
```

This uses `backend/pb` as the data directory, so the SQLite DB, `storage/`,
`pb_backups/` and runtime uploads land inside it (git-ignored). Hooks are picked
up automatically. Import the schema and seed as above on a fresh DB.

Notes:

- The Next.js app talks to this instance via `NEXT_PUBLIC_POCKETBASE_URL`
  (see `next.config.mjs`).
- Regenerate `pb_schema.json` by editing collections in the dashboard with
  `--automigrate=false`, then exporting (Settings → Export collections).
- See `docs/schema-reconciliation.md` for how the old and fork schemas were
  merged and why specific fields/rules look the way they do.
