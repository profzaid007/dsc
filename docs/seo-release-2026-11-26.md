# SEO and public content release — 26 November 2026

## Changes

- Add explicit Arabic and English public URLs, language-switch links, reciprocal hreflang and localized canonical/sitemap entries. Articles remain independent authored records.
- Render portal lists and footer links from server-provided public data. Render published homepage services and blog content without the previous article loading boundary.
- Provide crawlable registration links and an independently accessible consultation form while retaining the consultation dialog.
- Generate distinct bilingual page titles without adding location or delivery wording. Provide optional CMS title overrides and a title map at `/cms/seo`, accessible through an action inside the existing CMS content area. Existing menu entries and ordering are preserved.
- Redirect legacy portal 3 to portal 4 permanently and normalize old CMS links. Education portal 4 continues to list only its own ten published services.

## Backend deployment

Both `pb_dsc_test.service` and `pb_dsc_prod.service` received the reviewed additive migration `1796500000_page_seo.js`. The security-policy module/public-read mappings were patched in place, preserving existing server-specific policy differences. No historical migrations or schema importer were deployed.

The first live test validation rejected anonymous collection reads and automatically restored the test database and prior policy; production was untouched. The migration was corrected to use explicit PocketBase field/rule setters. A second rehearsal checked actual rules, fields and indexes on isolated snapshots of both environments before deployment.

Final deployment succeeded for both environments. Original row counts in 42 business collections were preserved. Public title reads returned HTTP 200 and unauthenticated writes were rejected. Services returned to active state.

Recovery snapshots (restricted to the server administrator):

- Test: `/root/dsc-seo-backup-test-20261126T041007Z`
- Production: `/root/dsc-seo-backup-prod-20261126T041007Z`

## Validation

- Production build and TypeScript passed.
- Targeted routing, title, CMS content and navigation tests passed.
- Local HTML checks verified bilingual titles, hreflang/canonical tags, published content without JavaScript, ten education services and permanent legacy redirects.

Netlify production and test projects both track `origin/dr-badr`; the release's Git commit is the deployment source. Final deployment receipts and HTTP verification are retained outside the repository in `work/seo-release-20261126`.

## Netlify redirect ordering

The first production HTML check confirmed content and bilingual metadata, but found that Netlify resolved the old portal redirect after the locale rewrite, discarding the URL language. The proxy now redirects the retired portal before rewriting. Regression coverage verifies permanent redirects, language and query preservation. The follow-up Git release includes this hosting-specific correction.
