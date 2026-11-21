# Test schema alignment — 21 November 2026

Aligned the live test PocketBase schema to production after a read-only comparison of all 50 collections and 90 SQLite schema objects.

Changes on test only:

- Added `parent_profiles.city_of_residence` with production's text-field configuration.
- Removed the unused `example` category choice from five collection field definitions.
- Matched the program and lecture list/view rules and the public lecture view query to production.
- Matched the `presentable` flag on `users.name` and `experts_public.name`.

The migration was rehearsed against a private server-side SQLite copy, then applied with only the test service stopped. Existing record values across 49 tables were compared before and after and preserved. Production was not modified. Test health and assignment/assessment/message-contact route checks passed afterward.

Final comparison found zero logical schema differences (excluding internal identifiers, metadata timestamps and credential values) and zero SQLite table/index/view-definition differences.

Recovery directory on the server: `/root/dsc-test-schema-align-20261121T040137Z`, including `before-live.db`, the migration payload, and rehearsal data. Restoring a database backup must be done with the test service stopped and must account for any writes made after this alignment.

The operational migration remains in the server recovery directory rather than the shared automatic migration tree: it was a one-time environment alignment, not a schema change to apply to production.

The test frontend was separately rebuilt with `NEXT_PUBLIC_POCKETBASE_URL=https://test.spcloud.pro`; its deployed login bundles were checked to reference that backend.
