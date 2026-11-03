# Production messaging quota deployment — 3 November 2026

Status: deployed and verified on `https://dsc.ac` and `https://backend-prod.dsc.ac`.

## Configuration

- Netlify project: `dsc-ac` (`10cd758d-ef81-4b6b-b915-9b1889a02e92`).
- Published release: [6ae977f9b2d8893d1dfe6905](https://app.netlify.com/projects/dsc-ac/deploys/6ae977f9b2d8893d1dfe6905).
- `DSC_MESSAGING_QUOTA_SECRET` is configured only for Netlify's production context. All other environment variables were preserved.
- The account rejects granular scopes and restricted secret storage. The user explicitly approved standard production environment storage: authorized Netlify UI/API users can read the value. The value is not exposed through a `NEXT_PUBLIC_` variable.
- PocketBase service: `pb_dsc_prod.service`, instance `/srv/pb_instances/pb_dsc_prod`, localhost port 8080.
- Root-owned secret file: `/etc/dsc/messaging-quota-prod.env`, mode `0600`.
- Systemd drop-in: `/etc/systemd/system/pb_dsc_prod.service.d/60-dsc-messaging-quota.conf`.
- The authenticated quota hook was activated after the matching frontend release was live. PocketBase was restarted and returned to active/healthy state.

The secret was generated on the VPS and transferred encrypted for Netlify configuration. Its plaintext value was not printed, put into Git, or included in the public browser assets. The temporary local plaintext copy and transport private key were removed after verification.

## Verification

| Check | Result |
| --- | --- |
| Production homepage | HTTP 200 |
| PocketBase health | HTTP 200 |
| Public quota request without secret | HTTP 403 |
| Public quota request with wrong secret | HTTP 403 |
| Public quota request with matching secret | HTTP 200 |
| Frontend invalid-login probe after backend activation | HTTP 401, proving quota reservations succeed before authentication rejects the invalid credentials |
| Backend secret file mode | `0600` |
| Public-asset scan | 578 files checked; no secret value found |
| Isolated local release scan | 3,012 files checked; no plaintext secret value found |

The rehearsed backend also enforced its quota limit with HTTP 429. Verification used only diagnostic quota buckets and invalid credentials; no email was sent and no business records were edited. The external verification completed at approximately 09:01 Arabia Standard Time on 3 November 2026.

## Release scope and recovery

The frontend was built from production baseline `e35b219c5deacf9d9b9737ab967a562749733d05`, adding the quota security changes in `lib/messaging-security.ts` and the five messaging API routes. Two page component default arguments were removed to satisfy generated Next.js page-prop types during the isolated build. Netlify's full build-and-deploy lifecycle published 301 public files and one server function. An earlier separate upload was stopped before publication because it selected the restored build directory instead of the adapter's public directory.

The initial quota-only release was deployed directly. This source update now includes its authenticated quota caller and the subsequent local audit fixes, so later Git-triggered production deployments retain the required header. The initial direct release did not contain the other audit fixes. Any additional deployment environment using the PocketBase fallback must configure its own matching server secret before adopting this caller.

Recovery material remains private on the VPS at `/root/dsc-quota-rollout-20261103`, including the original hook, a consistent pre-change database snapshot, rehearsal results and activation receipt. The previous frontend release is `6ae8ff714a8d8cd6aed30581`. Any rollback must coordinate the caller and backend hook; reverting only the frontend would remove its quota authentication header. No database restore was needed during this rollout.

Local non-secret receipts, source manifest and redacted build/deploy logs are in `../work/quota-rollout-20261103` relative to the repository root.
