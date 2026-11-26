# Public events server rendering — 26 November 2026

The events index, lecture list, training list and both detail routes now fetch their public records on the server. Existing interactive components receive those records as props, so titles, descriptions, dates and detail links are present in the initial HTML without JavaScript. The detail metadata reuses the same cached public record loader.

Anonymous PocketBase clients and explicit published-status checks keep draft/cancelled records out of public output. Missing detail records return 404; backend failures display an unavailable state with retry instead of a loading placeholder or an incorrect empty catalogue. The combined index retains a successfully loaded source if the other fails.

Search, filters, calendar navigation and enrolment remain client interactions. Initial browser effects no longer fetch event records again. Existing administrative card callbacks are unchanged; public cards use ordinary detail links. Classification labels and the initial calendar clock are supplied from the server. The first hydration uses the server clock and deterministic dates, then switches to visitor-local date/time display. The main navigation and education service list are unchanged.

Validation includes:

- Public-loader tests for publication filters, missing records, outages and anonymous access.
- Server-rendered future-programme enrolment fields without an initial Checking/Loading state.
- Bilingual HTTP checks for all five public routes and missing-record 404s.
- Browser checks of search filtering, calendar navigation and detail navigation, with no page errors.
- Existing navigation and event image-upload regressions, TypeScript, lint and production build checks.

No backend migration or data changes are required for this release.

The full post-deployment sitemap audit also found an existing draft lecture in the test sitemap. The follow-up sitemap filter now matches public lecture visibility (published/completed), and the integration check follows every sitemap-listed event detail URL to prevent advertising unpublished pages.
