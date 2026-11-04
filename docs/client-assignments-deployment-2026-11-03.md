# Client assignment endpoint repair — 3 November 2026

The deployed `dsc-test.netlify.app` frontend uses `https://backend-prod.dsc.ac`.
Its `/api/dsc/my-assignments` request returned HTTP 404 because the route and its
handler had not been installed on that backend. The frontend source already
included the request; this was a backend deployment mismatch.

## Applied repair

Installed only these files from commit `57762a4cd204a87a0c963af18480da9b21a4e946`:

| File under `pb_hooks/` | SHA-256 (LF source) |
| --- | --- |
| `client-assignments.pb.js` | `5baa4343e1718e1e51c05be4badf0331d4b64dabcf66a69c84d8fed512952d99` |
| `lib/client-assignments.js` | `2eada76391bc92f2dedf969679d085959b82850e135fe97080ef3080214f2ebc` |

Target: `/srv/pb_instances/pb_dsc_prod`, service `pb_dsc_prod.service`.
Existing authentication and owner-display dependencies were checked for
compatibility and left unchanged. Downloads were pinned to the commit and
verified before installation. No database records, schema, permission rules,
environment variables or secrets were changed.

The service was restarted and returned healthy. Recovery state, payload hashes,
a receipt and a rollback script are stored at:

`/root/dsc-client-assignments-rollout-20261103T183029Z-b3a45d`

The rollback script removes only the two newly added files after checking their
hashes, then restarts the same service. It does not restore or alter a database.

## Verification

- Public backend health: HTTP 200.
- Assignment summary without authentication: HTTP 401, replacing the previous 404.
- Existing assessment and message-contact routes: still HTTP 401 without authentication.
- Disposable PocketBase integration verifies all four client roles, correct owner
  isolation, hidden-assignment exclusion, assessment recipient ownership, no
  private configuration in the summary, and rejection of an expert account.
- On 4 November, the account holder confirmed that a hard refresh removed the
  error and the assignments page loaded successfully.

Before publishing client frontend changes, verify backend route readiness with:

```sh
node tools/check-client-backend.mjs https://backend-prod.dsc.ac
```

This check sends no credentials and reads no client records. A missing route,
unexpected anonymous access, redirect or unreachable service fails the check.
