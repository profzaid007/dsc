# Editable classifications

The persisted `specialist_role_categories` collection is the runtime source for classification names and keys. The JSON catalog supplies initial seeds only. Authorized administrators can add classifications, edit bilingual names, activate/deactivate records, and delete unused entries from Settings → Classifications. Keys are stable identifiers and are read-only after creation to preserve existing references.

The landing-page expert selector, allocation groups, specialist role selector, article forms and filters, program forms, lecture forms, and event listings read the saved classifications. Changing a label does not replace its database ID or change any existing role/content association. The reserved `dsc-news` classification remains content-only and is not offered for specialist roles.

## Settings pages

- `/dashboard/admin/settings/classifications`: classification CRUD.
- `/dashboard/admin/settings/roles`: role CRUD with a required category relation and matching `role_group` key.
- `/dashboard/admin/settings/tool-types`: lookup rows fixed to `tool_types`.
- `/dashboard/admin/settings/user-types`: lookup rows fixed to `user_types`.

Old `/settings/specialists` and `/settings/lookups` bookmarks redirect to Classifications and Tool types.

## Backend deployment

Frontend publishing does not update PocketBase. Apply the unified-classification migration, the research/other additions, then `1793400000_editable_classifications.js`. Install the latest `classification.pb.js` and `lib/classification-validation.js` hooks. Generate mirrored deployment files using `node tools/build-classification-artifacts.cjs`; historical migration files are immutable.

The editable-classification migration retains existing field types, IDs, and values, and sets create/update/delete API rules to the corresponding `settings` permission for active accounts (or Super Admin). When a classification is added, the request hook extends content-field select options without replacing fields or records. API validation checks the saved category record rather than a compiled whitelist.

Backend deletion guards block removing classifications referenced by roles, subcategories, articles, programs or public lectures. Unused classifications can be deleted. Used subcategories cannot be deleted or moved to a different parent. Classification and subcategory keys cannot be changed after creation.

For the known test server, use only `/srv/pb_instances/pb_dsc_test` and `pb_dsc_test.service`, with a consistent database backup before migration. The prepared console script stops that service, backs up data and hooks, stages the required migrations, installs hooks, and verifies backend health. Other instances are not changed.

## Validation

Tests cover preserved IDs/content during migration, exact legacy category mapping, Research/Other records, custom role keys, classification Add/Edit/Delete API requests, edited bilingual labels, custom categories on articles, blocked deletion when referenced, UI permission checks and independent lookup lists. Runtime selector tests ensure saved labels and custom keys are used and deleted defaults are not recreated in the UI.
