# Unified classifications

The shared main categories and the legacy subcategory mapping are defined once in `lib/classification-catalog.json`. Seven professional categories (including Research and Other) accept specialist roles; `dsc-news` is reserved for authored content. Main categories are fixed; administrators can manage subcategory labels and assign unused subcategories to a parent in CMS → Blog → Categories. Subcategories are shared by articles, training, and public lectures.

The landing-page expert selector, allocation role groups, article filters/editor, program editor, lecture editor and public event category filters use this catalog. Existing specialist-role IDs, tool permissions and expert selections remain intact. Legacy `psychology` becomes `mental-health` while retaining its database ID. Unknown historical categories are preserved and archived from new main-category selections. Existing program labels are backfilled only on an exact match; unmatched labels remain visible in the editor until an administrator classifies them.

Run `node tools/build-classification-artifacts.cjs` after changing the canonical catalog or backend validation. Generated artifacts are checked in under both PocketBase deployment trees.

## Backend deployment is separate from Netlify

Apply `1793200000_unified_classification.js` followed by `1793300000_research_and_other_categories.js` and deploy these hooks before using the new classification forms:

- `classification.pb.js`
- `lib/classification-catalog.js`
- `lib/classification-validation.js`

The known test instance is `/srv/pb_instances/pb_dsc_test`, service `pb_dsc_test.service`, user/group `zephyr`. Stop that service, back up `pb_data/data.db` and existing hooks, run the migration with the instance's PocketBase binary, install the hooks, restart, and check `/api/health`. Do not apply these steps to other instances. A frontend deployment does not update PocketBase.

Backend validation rejects a specialist role in the media category and rejects mismatched parent/subcategory pairs. Used subcategory keys and parent assignments are protected against changes that would invalidate existing references. Main categories cannot be deleted through the API. Rollback retains classifications; use a reviewed database backup for a full restoration.

## Verification

`tests/classification-integration.test.mjs` runs a disposable PocketBase 0.31 database and localhost API. It verifies seven active main categories, preserved roles/tool permissions, preserved article content and subcategory IDs, exact legacy-training matching, retained unmatched labels, public lecture projection fields, idempotence, parent-child validation, and media-only role rejection. Existing allocation and public-expert filter tests cover original role IDs and expert selections.

The additive research/other migration reuses an existing Other category (including a legacy custom key) by its bilingual label and retains its ID and linked roles. `dsc-news` remains a separate content-only category and is excluded from specialist-role category selectors. Historical migration files are not regenerated when the catalog changes.

## Settings navigation

- `/dashboard/admin/settings/classifications`: shared classifications, including the content-only media category.
- `/dashboard/admin/settings/roles`: specialist roles; each saved role requires a `category` relation and its matching canonical `role_group` key. The table displays the category name and key.
- `/dashboard/admin/settings/tool-types`: the tool-type list, fixed to `lookups.type = "tool_types"` for reads and creation.
- `/dashboard/admin/settings/user-types`: the user-type list, fixed to `lookups.type = "user_types"` for reads and creation.

Old `/settings/specialists` and `/settings/lookups` bookmarks redirect to Classifications and Tool types. Splitting the settings pages does not change record IDs or require a new database migration.
