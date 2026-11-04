# Public blog rendering repair — 4 November 2026

The public URL `/blog/new-post-1792319269035` returned a Next.js server error
(digest `2255480510`). The record exists and is published. Its backend response
contains `title_ar`, `title_en`, `content_ar` and `content_en`, while the public
page passed absent canonical `title`/`content` values to the strict reader.

All six published records currently use the legacy fields. One published record
has differing language copies, so the existing canonical-field migration cannot
be applied safely without reviewing that authored content.

## Repair

- Added a read-only public adapter for legacy articles and blog-listing summaries.
- Canonical strings remain authoritative, including intentionally empty strings.
- Legacy posts use the selected interface language, with the other stored version
  as a fallback when that translation is empty or absent.
- The strict canonical reader and write payload remain unchanged. No article
  content, schema, translation copy or publication status is modified.

This repairs public reading; it does not complete the backend's canonical-field
migration or choose between differing authored versions for CMS editing.

## Validation and release scope

- 212 unit/component tests passed, including legacy Arabic/English page rendering,
  canonical-value priority and the existing CMS layout/sanitizer regressions.
- Type checking and targeted lint passed.
- An isolated preview using the public backend rendered the affected article in
  both interface languages, all six published articles and the blog index.
- The isolated release starts from the exact current production commit
  `57762a4cd204a87a0c963af18480da9b21a4e946`; only the two public blog readers,
  their shared content adapter and related tests are patched.

The user explicitly approved production publication on 4 November 2026 after
automatic approval review initially required separate deployment approval.
Netlify production deploy `6aeb3782c835da1fcb007bf7` is live at `https://dsc.ac`,
replacing `6aea208ad3e399e2cfd36871`.

Post-deployment checks passed for all six articles in both interface languages,
the blog index in both languages, and the homepage (15 HTTP checks, all 200).
Article checks require a rendered heading and reject the reported server-error
page. Stored content and database schema were not changed.
