Experts can choose multiple roles under Role Group / Role in registration and in
Professional Details when editing their profile. These selections use the same
`roles_management` IDs as allocations and are stored in
`expert_profiles.specialist_roles`. They do not create case assignments or grant
tool access.

For an existing database, apply
`pb_migrations/1792800000_expert_role_selection.js` with the normal PocketBase
migration process. This adds missing group fields and the profile relation, and
creates `expert_roles_public`, an anonymous read-only view containing role labels
and grouping information. It does not expose tool permissions. Existing IDs and
profile selections are preserved. The canonical `backend/pb/pb_schema.json`
includes the same fields and view for fresh installations.

The selector can also read an existing role catalog when its API rules permit
access, so authenticated installations remain usable while deploying the view.

The homepage's Specialist category filter uses these same Role Groups and the
expert's saved role IDs. Apply
`pb_migrations/1792800100_public_expert_role_filter.js` after the role-selection
migration to include `specialist_roles` in `experts_public`. The homepage reads
role grouping from `expert_roles_public`, so visitors do not need access to
private roles or expert profiles. Experts with several roles appear under each
matching group; All categories retains experts with no roles selected.

## Existing published backend

For a backend managed by schema imports rather than the repository's migrations,
use `backend/pb/repair-expert-role-filter.mjs` instead of reimporting the entire
schema. It preserves the installed category relations, all existing fields and
records, and the public view's active-expert restriction. It adds the saved role
IDs to `experts_public` and creates the safe public role view. It maps the older
`psychology` category key to the profile selector's `mental-health` group.

Set `PB_URL` to the backend used by the published site. Run the script without
flags for a read-only check. To apply, set `PB_SUPERUSER_EMAIL` and
`PB_SUPERUSER_PASSWORD` securely in the local environment, then run:

```powershell
node backend/pb/repair-expert-role-filter.mjs --apply
```

Do not paste passwords into chat or commit them. The script imports only the
affected collections with `deleteMissing: false`; it does not replace the full
schema. After applying, redeploy the frontend on Netlify to refresh any homepage
HTML generated during the earlier build, and verify the live category filter.

PocketBase 0.31 also rejects the newer `@request.body.*:changed` syntax. Profile
saving updates the user first, so this fails before any selected roles are saved.
`1792800200_profile_update_rule_compat.js` replaces the unsupported checks in
`users.updateRule` and `expert_profiles.updateRule` with their equivalent
`(@request.body.field:isset = false || @request.body.field = field)` expressions.
Admin/owner restrictions and protected-field checks are retained. The targeted
repair script and canonical schema include the same compatibility fix.

## Deleting specialist roles

`1792800300_unused_specialist_role_deletion.js` enables deletion by active
administrators only for roles with no `case_experts.role_id` or
`expert_profiles.specialist_roles` references. This rule uses reverse relations
and protects linked data even before the request hook is deployed. It matches
the canonical schema. Deletion errors stay inside the confirmation dialog and
also appear as a notification, so they remain visible when the page is scrolled.
