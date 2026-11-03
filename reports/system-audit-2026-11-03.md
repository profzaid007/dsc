# DSC local system audit — 3 November 2026

## Commit verification

The exact staged source snapshot was exported and checked independently of pre-existing working-tree edits. All 176 unit/component tests and both 20-test security suites passed. TypeScript, a complete production build with webpack, and lint passed; lint reports 108 existing warnings and no errors. Credential files and generated local logs are excluded from the commit.

## Production quota rollout completed

The messaging quota protection is now live on both production services. The matching secret is configured in Netlify's production context using standard environment storage explicitly approved by the user, and in a root-owned `0600` PocketBase environment file. Public requests without the correct secret return 403; an authenticated diagnostic reservation returns 200. The frontend invalid-login probe returns 401 after successful quota reservations. No email was sent. See `docs/production-quota-deployment-2026-11-03.md` for verification, release scope, storage limitations, recovery information and the Git deployment follow-up.

## Follow-up corrections

The sections below record earlier validation stages; their statements about production being unchanged describe those earlier stages. The production quota rollout above and its deployment document record the later live change.

The subsequent cleanup fixed CMS home-page loading failures (visible error and retry, stale response protection), guarded training enrollment and tool-type loading, and made editor initialization read the latest content/direction after asynchronous imports. Direction changes now update the editor without recreating it on every keystroke. Hook dependencies and memoized callbacks now match their actual inputs.

Unread badges now isolate results by account and ignore superseded polls. Video previews have native playback controls. File preview URLs are allocated after render and released on replacement, removal, dialog close and unmount; the multiple-choice builder no longer allocates a new URL every render. Replaced deprecated PocketBase `files.getUrl()` calls with `files.getURL()` across application code, and removed 56 unused imports.

Follow-up validation: 182/182 unit/component tests pass, including four new regression tests for video controls, file URL lifecycle, unread badge isolation and CMS retry/races. Production build and TypeScript pass. ESLint has zero errors and 108 warnings (down from 186): 49 unused variables, 43 synchronous effect-state advisories and 16 native-image performance suggestions. These remaining warnings are not claimed to be resolved. No lint rules were weakened in this follow-up. The build no longer emits the PocketBase file URL deprecation warnings. Production and browser workflows have not been changed or verified in this pass.

## Correction status

The findings below record the original audit. The local checkout has since been corrected:

- PocketBase quota reservations now require a server-only secret, compared with PocketBase's constant-time equality helper. Both hook trees are updated. Missing configuration fails closed.
- All five messaging endpoints reserve the global delivery budget only after payload and access validation. Client throttling runs first.
- ESLint rule scope now matches plugin registration. CommonJS test loaders and PocketBase VM code have environment-appropriate overrides; frontend rules remain active.
- Test fixtures now supply current field types, native relation arrays, public role categories, the CaseName component dependency, and allocation classification. Localization tests cover the existing unified title UI, and the catalog test checks the explicit correction error required by the current strict contract.
- Added quota regressions for missing secrets, incorrect credentials, client throttling, and Redis limits. Backend security tests include the quota migration and run the allocation permission assertions successfully.

Validation after corrections: 178/178 unit/component tests; 20/20 security integration tests with inferred schema; 20/20 with canonical schema; TypeScript and the production build pass. ESLint passes with zero errors and 186 existing warnings. Deployment configuration is documented in `docs/security-management.md`: without Upstash, both services must have the same random `DSC_MESSAGING_QUOTA_SECRET` of at least 32 characters. Production has not been changed.

Scope: current working checkout, including existing uncommitted changes. Reviewed API messaging routes, authentication, registration notification flow, public expert loading, backend quota handling, migration tests and project checks. No production requests or data changes were made. This is a code and automated-test audit, not a complete browser or production audit.

## Confirmed findings

### High: unauthenticated callers can exhaust the shared messaging quota

`pb_hooks/messaging-quota.pb.js:2–44` exposes a POST endpoint without authentication or a server-only credential. A body of `{"scope":"global"}` increments the same `global:all` reservation used by every Next.js messaging route. Thirty calls exhaust it for sixty seconds; repeated calls can sustain the interruption. `lib/messaging-security.ts:83` reserves this global quota before validating the body or authenticating the caller.

Reproduced the actual hook in an isolated Node VM with an in-memory PocketBase API substitute: unauthenticated calls 1–30 returned 200, and reservation 31 returned 429. No running backend was contacted. The direct backend path affects deployments using PocketBase quota fallback rather than Upstash. Independently, the public Next.js messaging routes also spend the shared global budget before per-client rejection, so repeated rejected requests can consume capacity even with Upstash.

Impact: contact mail, consultation requests, administrative mail and application/case notifications can all be blocked. Require authenticated server-to-server quota reservations, and ensure abusive clients cannot consume the shared budget before client-level validation and throttling. Cover this behavior with a disposable integration test.

### Medium: linting does not execute

`eslint.config.mjs:13–19` applies React Hooks rules globally, while the inherited plugin registration is file-scoped. Running `npm run lint` exits with a configuration error: rule `react-hooks/set-state-in-effect` cannot find plugin `react-hooks`. Consequently, lint findings are not being checked. Scope these overrides to the same React/TypeScript files as the inherited plugin configuration, or register the plugin for every file receiving those rules.

### Medium: automated regression coverage is currently unreliable

Unit/component run: 176 tests, 167 passed, 9 failed.

- Care foundation migration: the mock fields omit `type: "select"`, so the current migration skips them. This failure does not demonstrate a production migration defect.
- Settings lookup creation: test cannot locate the expected rendered node and dereferences undefined. Requires checking the fixture against the current UI before concluding creation is broken.
- Public team role filtering: two tests reject the new `./expert-list-fields` dependency before testing behavior.
- Arabic training/lecture forms: two assertions expect the older bilingual interface; rendered training input now uses `dir="auto"` instead of the expected `ltr`. Confirm intended single-field content behavior before changing code or expectations.
- User assignment links: three tests reject the `@/components/cases/CaseName` dependency before exercising pagination, access control or retry behavior.

Security integration run: 19 tests, 18 passed, 1 failed. The allocation permission test fails during specialist fixture creation with HTTP 400, `Select a professional classification.`, at `tests/security-integration.test.cjs:828`. Its allocation permission assertions are never reached. Update the fixture with the required classification before treating this test as evidence about allocation security.

## Verification

- `npm run typecheck`: passed.
- `npm run build`: passed; 94 pages generated. PocketBase emitted deprecated `getUrl()` API warnings.
- `npm run lint`: configuration failure described above.
- Unit/component tests: `node --import tsx --test --test-reporter=tap` over all `.test.cjs`, `.test.ts`, and `.test.tsx` files excluding filenames containing `integration`.
- `npm run test:security`: disposable local database; 18/19 passed.

Evidence logs are at repository root: `audit-build-results.log`, `audit-unit-results.log`, and `audit-security-results.log`. Application source and existing user changes were left unchanged.
