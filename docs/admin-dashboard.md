# Administrator statistics

The overview at `/dashboard/admin` reads the authenticated administrator's permitted PocketBase collections. It uses exact `totalItems` counts, requesting only one record's `id` per query. It neither downloads personal profiles nor changes records. At most four requests run concurrently.

| Indicator | Source | Meaning |
| --- | --- | --- |
| Users | `users` | All user accounts |
| Expert profiles | `expert_profiles` | Expert profiles, rather than approved accounts |
| Cases | `cases` | All cases |
| Training | `programs` | All training programs |
| Public lectures | `public_lectures` | All lectures |
| Assignments | `case_tools` | All assignments |
| Monthly activity | `users.created`, `cases.created` | Records created in each UTC calendar month; current month is partial |
| Case status | `cases.status` | Payment workflow: pending, awaiting payment, under review, active, other |
| Account mix | `users.role` | Account roles; administrators combine admin and super admin |
| Events | `programs.status`, `public_lectures.status` | Total, published and completed counts for each permitted event module |

The six/twelve-month selector affects monthly activity; totals and status distributions cover all time. These separate count requests are not a database transaction: values may change while a refresh is in progress.

Expert approvals require both users and experts read permissions. Payment reviews require both cases and payments read permissions. Pending assignment counts include `status = "pending"`. Financial amounts are not loaded.

Missing permission hides a metric and prevents its requests. A failed request produces an unavailable value, not zero. Partial results can be retried. Account, grant or period changes hide stale results and cancel the previous request group.

Run `npx tsx --test tests/admin-dashboard.test.ts tests/admin-dashboard-view.test.tsx` to check permission gating, status distributions, unavailable data, month boundaries, request concurrency, cancellation, Arabic/English markup, chart data accessibility, and loading/empty/error states.

The view and responsive CSS received an independent source review. Browser screenshot checks were not repeated after the earlier Chrome crash. Server-render tests do not verify pixel layout or interactive browser behavior.
