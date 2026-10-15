# Security management

Security administration is available at `/dashboard/admin/security` to an active
application Super Admin. The interface supports Arabic, English, and RTL.

## What is implemented

- Create, edit, deactivate, and delete unassigned custom security roles.
- Assign multiple roles to staff accounts (`users.role = admin`).
- Per-module Create, Read, Update, and Delete grants, with Read required before
  granting another action in the same module. Unsupported actions are disabled.
- Separate expert approval, password reset, and payment export permissions.
- Paginated, immutable-through-the-application audit history with before/after
  access changes. Account deletion includes owned profiles in one transaction.
- Permission-aware dashboard navigation, route guards, and mutation controls.
- Native PocketBase rules enforce collection scopes, relation expansion, private
  files, and realtime access. Custom routes independently check current grants.
- Revocation/deactivation applies on the next backend request. Stale realtime
  connections are discarded when their account/grant snapshot changes.

The existing account types control registration, profiles, and dashboard routing.
They are distinct from configurable security roles. `roles_management` continues
to represent specialist professions and is managed by Settings permissions.

## Access behavior

Grants from active roles combine. An inactive account or role grants no protected
access. New staff accounts have no operational grants until Super Admin assigns
a role. Existing staff receive a system Administrator compatibility role during
the migration. That role can be edited or deactivated, but cannot be deleted.

Super Admin controls role management, assignments, account type/status changes,
and privileged accounts. Staff may approve a pending expert only through the
expert approval operation when granted `experts.approve`. General user-edit
access never permits promotion or managing another administrator's credentials.
Self-deletion/deactivation/demotion and removing the last active Super Admin
are blocked transactionally. Infrastructure PocketBase superusers remain outside
application RBAC and must not be used by the frontend.

Customer-owned and expert-assigned records retain their existing scopes. Pending
experts can create their own application profile but cannot use protected
operational modules. Public pages and shared reference lists retain public access;
granting Settings Read controls the management interface, not whether a visitor
can see public payment bank details or profession names.

Payments have their own API and expose only payment-relevant case fields to
payment staff. Case-only staff cannot read payment details or change financial
fields. Payment exports require an additional grant. Any user authorized to read
data can of course copy what they can see; Export controls the built-in operation.
Sensitive file URLs require a short-lived PocketBase file token and current
record access. Public avatars and published expert photos remain public.

Some screens combine modules: allocating an expert can need Experts Read and
Cases Read for rich selection labels; assigning a tool can need Tools Read and
Allocations Read. Missing supporting grants do not broaden backend access.

## Deploy to an existing database

Application code is implemented and tested; the working site's database has not
been migrated by this task. Coordinate the backend migration/hooks and frontend
deployment. The frontend deliberately denies staff access if policy loading fails.

1. Back up the target PocketBase data and verify an active application Super Admin
   account exists. Check its current schema against the supported collections.
2. Deploy the contents of `backend/pb/pb_hooks/` together, including its `lib/`
   files. The root `pb_hooks/` contains equivalent security hooks for local use.
3. Deploy **only** `backend/pb/pb_migrations/1792900000_security_management.js`
   into the target's active migrations directory. The historical
   `pb_migrations_legacy/` files are not part of this upgrade.
4. Apply migrations using explicit directories for the intended target. For
   example, from the repository directory, with the real deployment data path:

   ```powershell
   & "C:/path/to/pocketbase.exe" migrate up --dir="C:/path/to/deployed/pb_data" --migrationsDir="backend/pb/pb_migrations"
   & "C:/path/to/pocketbase.exe" serve --dir="C:/path/to/deployed/pb_data" --migrationsDir="backend/pb/pb_migrations" --hooksDir="backend/pb/pb_hooks"
   ```

5. Deploy the frontend and open `/dashboard/admin/security` as Super Admin.
   Review the compatibility role and assign narrower roles to staff as needed.
   Verify a read-only staff account using direct API calls as well as the UI.

The migration adds security collections, the server-controlled
`users.security_permissions` projection, indexes, seeds, and access rules. It
preserves existing records and account-type fields. Do not run the full
`deleteMissing` schema import to upgrade a populated database.

The down migration intentionally refuses to restore blanket administrator access.
Rollback requires a reviewed backup plus coordinated frontend/backend rollback;
preserve the role assignments and audit records for recovery.

For local development, the existing `local-backend/start.ps1` copies the root
migrations to the local runtime; it will include the new additive migration.
Use that script with the intended local working directory/data path.

## Fresh installation

The canonical `backend/pb/pb_schema.json` contains the updated fields and rules.
After importing it into an empty database, run the security migration above to
seed the application-owned permission catalog and compatibility role. Then run
the existing `backend/pb/seed.mjs` workflow to create the first Super Admin and
application defaults. Security migration initialization handles both an older
schema and a fresh canonical-schema import.

## Maintenance

Authoritative security implementation:

- `backend/pb/pb_hooks/lib/security-policy.js`: catalog and permission evaluation.
- `backend/pb/pb_hooks/lib/security-management.js`: transactional access changes.
- `backend/pb/pb_hooks/lib/security-payments.js`: scoped payment operations.
- `backend/pb/pb_hooks/security-management.pb.js`: routes and native request guards.
- `backend/pb/security-migration-source.js`: additive installation procedure.

After changing these files, run:

```powershell
npm run security:generate
```

This regenerates the two deployment migration copies, local security hooks, and
canonical schema. `security-schema-rules.json` retains the original rule baseline
for deterministic generation and upgrade tests; business fields stay in the
canonical schema. Review additions to the collection/module map when adding a
new protected module. A new catalog entry alone does not secure a new endpoint.

## Validation

```powershell
npm run typecheck
npm run build
npm run test:security
npm run test:security:canonical
```

Integration tests start PocketBase on a random localhost port with a disposable
temporary database and test-only credentials. They never use `.env.local`,
existing data directories, deployment credentials, or a remote database.
Set `SECURITY_TEST_POCKETBASE` to the executable path if it is not installed at
`../work/pocketbase/pocketbase.exe`. Backend tests were executed with the bundled
PocketBase **0.40.5**; verify the target runtime before deployment.

Coverage includes direct CRUD denials, multiple-role unions and revocation,
invalid grants, privilege escalation, expert approval, payment-field isolation,
private file access, event scopes, allocation replacement, realtime revocation,
atomic account/profile deletion, dedicated password resets, audit pagination,
and competing Super Admin mutations. Desktop/mobile Arabic/English management
flows were also reviewed in the browser.
