# B2 backup setup — 26 October 2026

Configured through the user's authenticated PocketBase and Backblaze browser
sessions after approval to create a restricted key, store it in PocketBase and
upload a complete backup.

- Backend: `https://backend-prod.dsc.ac`
- Private existing bucket: `DSCB2Backup`
- B2 endpoint: `s3.us-east-005.backblazeb2.com`
- Region: `us-east-005`
- Application key name: `dsc-pocketbase-backups`, restricted to this bucket,
  Read and Write access; account-wide bucket-name listing not enabled.
- Backup S3 storage enabled, path-style addressing enabled.
- Automatic backups enabled, cron `0 0 * * *` in UTC: 03:00 Asia/Riyadh daily.
- PocketBase automatic backup retention: 30. The manually initialized first
  backup is additional to this automatic-backup limit.

First backup `dsc-b2-first-2026-10-26.zip` successfully appears in both the
PocketBase backup list (86.48 MB as displayed there) and B2 Browse Files
(90.7 MB as displayed there; different size units). Saved settings were
rechecked after reloading the admin page.

Bucket encryption was already enabled. No client-side archive encryption,
restore rehearsal or backup-failure alerting was added. A successful first
upload verifies connectivity and archive creation, not restoration.

B2 lifecycle is **Keep only the last version**, enabled after the user explicitly
approved cleanup of hidden older versions. The bucket overview confirms the
saved rule. This cleans up superseded/hidden versions of each object; each
dated backup remains a separate object. PocketBase still controls retention of
30 automatic backups. Lifecycle cleanup is asynchronous, not an immediate purge.

No key secrets are recorded in this file. The pre-existing broad `DSCAppKey`
was left unchanged. Existing local backup archives were not migrated or deleted.
No live restore or application-data modification was performed.

## Configuration reset and repair later on 26 October

The user's screenshot showed empty S3 fields and automatic backups disabled.
A fresh admin-page reload confirmed this was not merely a stale tab. Read-only
inspection of the production instance's `_params` settings record confirmed
an empty backup cron, retention 3, and disabled/empty backup S3 settings.
The event that reset the settings has not been established.

Reapplied the previously approved B2 connection using the same restricted key,
daily UTC schedule and retention 30. PocketBase reported S3 connected
successfully. Independently checked the production database to confirm the
persisted bucket, enabled S3, cron and retention, without printing credentials.
Reloaded both open admin tabs and verified the restored settings in the second
tab. The first B2 backup remained available. No database restore, service
restart or credential replacement was performed.

The production and test instances are separate server directories/services;
this repair was verified in `pb_dsc_prod`. It does not establish that the
separate `pb_dsc_test` instance has automatic off-site backups enabled.
