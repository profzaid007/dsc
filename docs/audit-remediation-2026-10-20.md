# Audit corrections — 20 October 2026

Status: implemented and verified in the workspace. After explicit user approval, the backend package was rehearsed on a private server-side database copy and deployed to the test instance. All original record counts were preserved. The frontend changes are included in this repair commit; publishing follows the branch deployment workflow.

| Original item | Correction | Status |
| --- | --- | --- |
| 1–4 | Additive migration repairs immutable-field comparisons for cases, case_tools, case_feedback and internal_messages, preserving ownership/payment guards. | Deployed to test backend |
| 5 | Complete, hashed runtime hook package includes the five missing files and the new transactional workflows. | Deployed; all 35 manifest entries verified |
| 6 | Both base-collection public rules and the public lecture view require a published, in-progress or completed status. | Deployed to test backend |
| 7–9 | Non-expert signup commits the account, role profile, child cases and optional guest training enrollment in one server transaction. Stable submission keys make retries idempotent; all four non-expert roles are covered. | Implemented; backend deployed; frontend local |
| 10–11 | Unassigned tasks continue the request chain. Specialty validation accepts arrays, JSON and comma-separated legacy values. | Implemented and tested |
| 12 | Empty age groups are explicitly submitted instead of omitted. | Implemented and tested |
| 13 | Expert account-name synchronization runs in the same backend transaction as the profile write. | Implemented; backend deployed; frontend local |
| 14 | Request generations, scope checks, auth-identity checks and unmount invalidation discard obsolete responses. File tokens and profile-save completions are scoped too. | Implemented and tested |
| 15 | The Settings landing route exposes individually permission-filtered destinations without requiring settings.read for Tools. Child-route authorization remains intact. | Implemented |
| 16 | Allocation changes invalidate the parent case's allowed tool types. | Implemented |
| 17 | Case lists and dashboard totals include assessment sessions, using a permission-checked metadata-only count endpoint. Pending dashboard totals also include assigned assessments. | Implemented; backend deployed; frontend local |
| 18 | Receipt submission immediately uses the saved case status in PaymentGate. | Implemented |
| 19–22 | Case records are the training enrollment source. A migration retains historical records while reconciling them into cases. Server transactions enforce capacity, duplicates and authoritative counts. Enrollment-specific read/update/delete routes preserve training-only staff access without exposing clinical case data. | Implemented and tested; backend deployed; frontend local |
| 23 | Server validation checks trimmed required strings, phone formats, actual dates and permitted selections; invalid writes roll back the account. Client phone and parent-name validation improved. | Implemented and tested |
| 24 | Emergency phone has a country-code selector, normalized international storage and an inline validation error. | Implemented |
| 25 | The welcome helper requests an expiring PocketBase password-reset/setup link; account passwords are no longer sent to the email route. | Implemented; existing PocketBase reset-email configuration is used |
| 26 | User/tool hooks expose persistent errors and retry; tool detail pages distinguish loading/failure from not found. | Implemented |
| 27 | Atomic shared quota reservations run in PocketBase, with optional Redis REST support. Unknown clients no longer share one five-request bucket. The development-only memory limiter remains for explicitly configured local backends. | Implemented and tested; quota migration deployed |
| 28 | Resend idempotency keys prevent duplicate primary emails on retry. Secondary Telegram failure does not turn accepted email delivery into a failed submission. | Implemented; live external delivery was not exercised |
| 29 | Localized default title plus localized registration-page titles. | Implemented and visually checked |
| 30 | Registration dropdowns have accessible names. | Implemented and visually checked |
| 31 | Measured footer/discovery contrast failures corrected. | English/Arabic mobile automated scans pass |
| 32 | Service-search ARIA relationship is present only when its target exists. | Implemented and visually checked |
| 33 | Age groups have independent keyboard-focusable removal buttons outside the dropdown trigger. | Implemented |
| 34 | Mobile case summaries include birth date, gender and linked-user email. | Implemented |
| 35 | Next and matching ESLint config upgraded to 16.4.2; SheetJS upgraded to official 0.20.3 distribution. The unused shadcn CLI dependency tree was removed; its existing static CSS utilities and license are preserved locally. | Production audit: zero advisories. Five development-only transitive advisories remain; see below |
| 36 | Both desktop and mobile logout actions require confirmation before logout/navigation. | Implemented |

## Verification

- Production build: passed.
- JavaScript/backend suite: **98 passed**, including **18 security integration tests** and the new transactional registration/enrollment/quotas regression.
- TypeScript/render suite: **43 passed**.
- Additional expert-submission/assessment integration run: **12 passed** (includes repeated engine coverage; do not add this to the totals above as wholly distinct tests).
- TypeScript: passed.
- ESLint: **0 errors, 194 warnings**. The framework upgrade introduced additional compiler advisory diagnostics, configured as warnings; warnings were not claimed resolved.
- Local homepage and Individual registration automated accessibility scans: zero violations in the checked English/Arabic mobile states.
- Real external email/Telegram delivery, all-role visual end-to-end coverage, load testing and backup-restoration drills were not performed.
- Source changes are included in the repair commit containing this report.

## Remaining dependency limitation

`braces` 3.0.3 is the latest registry release and remains affected by GHSA-vfj7-8cjw-p6xm. Five audit entries represent this development-only dependency chain: `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`. The scanner's force-fix would downgrade the Next ESLint configuration to 14.2.35; that incompatible downgrade was not applied. Production dependencies report zero vulnerabilities.

References: [SheetJS official installation](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/), [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

## Backend deployment

Prepared local package: `../work/dsc-audit-repairs-20261020.zip`. The manifest hashes every included hook/migration. The package contains no SSH keys, environment files or database records.

Approved and deployed target: `root@31.97.154.77`, test instance `/srv/pb_instances/pb_dsc_test`, service `pb_dsc_test.service`. The local deployment helper `../work/deploy-audit-repairs.py` rehearses migration on a private server-side SQLite snapshot, checks original record counts, takes a recovery backup before applying, verifies deployed file hashes and checks backend health. The helper was uploaded and run after user approval. Both rehearsal and deployment succeeded. Recovery backup: `/root/dsc-audit-backup-20261020T123316Z` (`data.db` and `recovery.tar`).

The backend hooks/migrations are deployed. The local preview points to this updated test backend. Publishing the frontend follows the deployment workflow for origin/dr-badr.

Final backend package SHA-256: 9d9218ccc1876fa031d014d198818da3948549f4e77c6b8758138e50ccfdee02. Runtime hook copies match after normalizing line endings; the assignment validator uses the current role_id relation in both trees.


## Test-server deployment verification

- User explicitly approved upload, private-copy rehearsal and deployment to `31.97.154.77`.
- Package SHA-256: `9d9218ccc1876fa031d014d198818da3948549f4e77c6b8758138e50ccfdee02`.
- All four `179410*` migrations applied; all 35 hook/migration hashes match the package.
- Original business record counts preserved in rehearsal and deployment.
- Service `pb_dsc_test.service`: active. Internal and public HTTPS health: 200.
- Public draft lecture count: zero, verified by SQL and anonymous HTTPS query.
- All four repaired update rules contain no unsupported `:changed` guards.
- New registration and quota routes reject invalid payloads (400); training/assessment metadata routes reject anonymous access (401); anonymous enrollment is denied (403).
- Verification created no accounts and sent no messages.
