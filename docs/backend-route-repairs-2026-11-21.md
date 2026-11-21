# Backend route repairs — 21 November 2026

Repaired two missing backend routes after connecting the dsc-test frontend to https://test.spcloud.pro.

## Changes

- Test, `/srv/pb_instances/pb_dsc_test`: installed `pb_hooks/client-assignments.pb.js` and `pb_hooks/lib/client-assignments.js`.
- Production, `/srv/pb_instances/pb_dsc_prod`: installed `pb_hooks/training-registrations.pb.js` and `pb_hooks/lib/training-registrations.js`.
- Restarted `pb_dsc_test.service` and `pb_dsc_prod.service` individually.

Each payload matched the corresponding existing file on the other backend after newline normalization. Before installation, verified the target files were absent, service paths were correct, required collection fields existed, shared security helpers matched inspected hashes, and both services were healthy. No database records, schema, access rules, credentials, or existing hooks were changed.

## Validation

- Existing local assignment and security integration suites: 24 passed, including client ownership isolation and training-only permissions.
- Both public backend health endpoints returned HTTP 200 after deployment.
- All 21 inspected GET routes returned HTTP 401 without credentials on both backends. This confirms route presence and anonymous authentication enforcement; it does not certify complete schema parity or authenticated behavior against live data.
- Both originally missing endpoints now return HTTP 401 rather than HTTP 404.

## Recovery

Server receipt: `/root/dsc-route-repair-20261121T034021Z/manifest.json`.

Rollback: `python3 /root/dsc-route-repair-20261121T034021Z/rollback.py` verifies hashes, removes only the four newly installed files, and restarts the two services. It does not restore or change database records.

Local deployment helper: `../work/repair-backend-routes-20261121.py`.
Verification results: `../work/test-backend-route-comparison-after-repair-20261121.json`.
