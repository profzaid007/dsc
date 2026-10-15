# Local development database

This baseline is inferred from application code, not exported from production.
It supports account and expert development. Other modules need their real schema
before full end-to-end testing. Never copy this bootstrap into production migrations.

PocketBase 0.40.5 is installed at `../work/pocketbase/pocketbase.exe`.
Data stays in `../work/pocketbase/pb_data`; back up this directory before changing schemas.

From the repository run:

```powershell
./local-backend/start.ps1
```

Site: http://127.0.0.1:3000
Development login: `admin@dsc.local` / `LocalDSC!2026`.
These are local demo credentials only. The server binds to localhost.
Outgoing application email is simulated when development mode and
`DSC_LOCAL_BACKEND=true` are both set.

Before using production, compare its schema and rules, deploy only reviewed
production migrations/hooks, change the PocketBase URL and remove the local flag.
Demo data is not automatically transferred to production.

The startup script explicitly uses `../work/pocketbase/pb_data` regardless of
the shell's current directory. It includes the additive security migration.
See [security management](../docs/security-management.md) for role permissions,
deployment, and isolated tests.
