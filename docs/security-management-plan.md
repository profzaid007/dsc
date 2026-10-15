# DSC security management — proposed design

Status: implemented in application/backend source. Deployment and usage are
documented in [security-management.md](security-management.md). The working
site's database has not been migrated by this task.

## Goal

Manage users, configurable security roles, and per-module Create, Read, Update,
and Delete permissions from an Arabic/English administration screen. Enforce
the same decisions at the backend, including direct API requests.

## Existing application

DSC uses Next.js and PocketBase. User management already exists at
`/dashboard/admin/users`. Account types are stored in `users.role`, including
`super_admin`, `admin`, `expert`, `individual`, `parent`, `care_foundation`, and
`organization`. Frontend route guards and backend rules currently use these
fixed values. Experts have specific access to cases, assignments, and tools.

Keep account types for registration, profiles, and dashboard routing. Introduce
security roles separately. The existing `roles_management` collection contains
specialist professions, so it must not be reused for authorization.

## Proposed data model

| Collection | Purpose | Principal fields |
| --- | --- | --- |
| users | Existing authenticated accounts | Existing fields remain unchanged |
| security_roles | Configurable access roles | key (unique), name_en, name_ar, description, is_active, is_system |
| security_permissions | Application-owned permission catalog | key (unique, e.g. cases.read), module, action, name_en, name_ar |
| security_role_permissions | Grants permissions to roles | role relation, permission relation; unique pair |
| security_user_roles | Assigns multiple roles to a user | user relation, role relation; unique pair |
| security_audit_log | Records access-management changes | actor, action, target_type, target_id, before, after, timestamp |

Permission definitions are maintained with application code. Administrators
manage grants; creating arbitrary keys would not add working functionality.
Assigned roles combine their grants. Inactive roles grant nothing. Do not add
direct user overrides or explicit deny rules in the first release.

## Permission catalog

Start with Create, Read, Update, and Delete for these modules, exposing only
operations actually supported by each module:

- Users and expert profiles
- Cases
- Tools
- Assignments
- Allocations
- Training
- Public lectures
- Payments
- CMS content and portals
- Settings

Model sensitive operations separately: `experts.approve`, `users.reset_password`,
`payments.export`, `backups.create`, and `backups.download`. Export, approval,
password reset, and backup access must not be implied by ordinary Read/Update.
Reserve role administration, role assignment, and audit access for Super Admin
in the initial release. Treat backups as Super Admin only initially as well.

Read includes list and record detail. Update does not imply Create or Delete.
Require Read when granting Create, Update, or Delete in the management screen,
and validate that requirement on the server. Delete remains subject to existing
linked-record and business constraints.

## Authorization policy

For every protected operation:

1. Validate the authenticated identity on the server.
2. Load current account status; an inactive account cannot access protected data.
3. Check the required permission against current, active role assignments.
4. Apply record ownership, expert assignment, workflow, and field restrictions.
5. Allow only if all applicable restrictions pass; otherwise deny.

An active application Super Admin can administer all modules, subject to data
integrity rules. PocketBase infrastructure superusers are a separate deployment
concern and must never be exposed to the browser.

Preserve existing public access, customer-owned records, and expert-assigned
records as explicit scoped policies. Staff grants must not accidentally broaden
those customer/expert policies. Initially, custom staff roles are assigned to
accounts with the existing `admin` account type; expanding other account types
into staff access can be a later feature.

Only Super Admin may assign security roles, alter account type/active status,
promote an account, or manage privileged accounts. Block self-deactivation,
self-deletion, and removal/demotion of the last active Super Admin. Ordinary
user update permissions must never permit changes to these protected fields.
Recheck these invariants transactionally to handle simultaneous requests.

Backend checks must cover PocketBase collection APIs, custom `/api/dsc/*`
routes, Next.js API routes, exports, file access, and realtime subscriptions.
Client-side hiding and route guards improve navigation but are not enforcement.
Resolve grants from backend state so revocation applies to the next request;
do not trust roles or permissions supplied by the browser or stale auth data.

## Administration screen

Add `/dashboard/admin/security`, visible to Super Admin, with three tabs:

1. **Roles and permissions:** searchable roles list; create/edit/deactivate;
   module-by-action checkbox matrix; save/cancel; assigned-user count.
2. **User access:** search existing users; assign/remove roles; display account
   status and effective permissions; link to existing user management.
3. **Audit history:** actor, time, action, affected role/user, and grant changes.

Support Arabic, English, and RTL using existing dashboard components. Show an
explicit unavailable/error state if backend policy configuration is missing;
never substitute full access after a failed permission load. Prevent deleting
assigned roles; offer deactivation instead. Require confirmation for destructive
actions and summarize which permissions a role edit adds/removes.

Example of a configurable role:

| Module | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Cases | Yes | Yes | Yes | No |
| Tools | No | Yes | No | No |
| Payments | No | No | No | No |

## Implementation stages

1. **Inventory and policy mapping:** map every collection, route, custom action,
   public view, and file path to a permission and record scope. Confirm the
   deployed PocketBase version/schema and actual migration entry point. The
   repository contains both root migrations/hooks and a canonical schema/hooks
   under `backend/pb`; establish one supported deployment path before rollout.
2. **Backend foundation:** add collections, unique indexes, permission seeds,
   policy evaluation, privileged-field guards, and transactional audit writes.
   Align the canonical schema and migration artifacts. Never log passwords,
   tokens, or unnecessary personal data in the audit log.
3. **Compatibility migration:** seed a system Administrator role and assign it
   to current active admins with the existing approved operational access.
   Preserve account types and existing customer/expert scopes. Verify the
   Super Admin recovery path before enabling stricter rules. Use additive,
   data-preserving migrations rather than a destructive full-schema import.
4. **Management interface:** build the tabs above and connect user management.
5. **Application integration:** add a shared permission-loading hook, gate routes,
   filter navigation, and gate buttons; enforce the same mapping in all backend
   entry points. Eliminate blanket admin shortcuts for mapped operations.
6. **Verification and rollout:** run integration tests against an isolated
   PocketBase instance, review the access matrix, back up the target environment,
   then deploy backend policy and frontend together. Rollback must preserve
   assignments and logs; avoid automatically restoring broad admin privileges.

## Acceptance criteria

- Super Admin can create/edit/deactivate roles and assign multiple roles.
- Effective access is the union of grants from active roles.
- A Cases Read-only staff user can list/view cases but cannot mutate them through
  either the UI or direct APIs.
- Missing authentication, inactive users, missing grants, and failed policy
  loading never yield protected access.
- A user cannot grant themselves privileges, modify protected fields, or manage
  Super Admin accounts through a general user update endpoint.
- Revoking a grant blocks the next relevant backend request without a new login.
- Customer ownership, expert assignments, public pages, linked-record deletion
  guards, and registration still work with their intended scope.
- Custom routes, exports, protected files, and realtime events obey the policy.
- Every successful access-management mutation produces an audit entry; a failed
  mutation does not produce a misleading success entry.
- Permission checks are tested for every action using allowed and denied cases,
  including ID tampering, concurrent last-Super-Admin changes, and direct API calls.

## Decisions proposed for implementation

- Multiple roles per staff user; grants combine without explicit deny overrides.
- Custom role management and assignment restricted to Super Admin initially.
- Existing account types and specialist professions remain separate concepts.
- Application-owned permission catalog; business users edit role grants.
- Preserve current valid access during migration, then let Super Admin restrict
  staff roles deliberately through the management screen.
