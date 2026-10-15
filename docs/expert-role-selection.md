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
