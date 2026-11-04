# Hostinger and server inspection — 26 October 2026

Used the user's authenticated Hostinger session for VPS `965921`
(`31.97.154.77`). No restore, restart, settings change, credential change,
deployment, or modification of live business data was performed. Archive
databases were opened from temporary copies, and live databases used SQLite
read-only mode with query-only enabled.

## Provider backups

The VPS Snapshots & Backups page lists two automatic weekly full-server backups:

| Date/time displayed by Hostinger | Size |
| --- | --- |
| 2026-10-19 13:08 | 20.65 GB |
| 2026-10-11 02:48 | 18.90 GB |

The page does not identify the timezone of those displayed timestamps. It offers
Restore for each backup, without an exposed download or per-file browsing action.
Neither provider backup was restored or inspected internally. Hostinger says older
backups are replaced automatically. No user-created snapshot was listed.

## Server copies and local storage

The authorized Hostinger web console opened an existing root session. Listed
database copies and archives under `/srv/pb_instances`, `/root`, and
`/var/backups`. Inspected DSC-related database files and ZIP archives under
`/srv/pb_instances` and `/root`, including manually retained recovery copies
not listed by PocketBase's backup UI.

Matched affected experts by account name because source/profile IDs differ
between instances. The October 12 DSC backup contains all six identified
experts, with empty photo references and no associated separate image files.
The inspected October 13, October 20, October 25 and retained recovery copies
likewise supplied no portrait for the matched experts.

Earlier September 15 and October 11 development copies do not contain these
experts. `pb_dev_dsc/aug10.zip` is a gzip-compressed TAR despite its extension;
its database does not have an `expert_profiles` table. These files do not
establish whether photos existed on a different historical source.

Also checked account/profile storage directories on the live `pb_dsc_prod`,
`pb_dsc_test`, `pb_dsc_dev`, and `pb_dev_dsc` instances. Matching experts have
no photo references or associated PNG/JPG/JPEG/WebP/JFIF images. This does not
identify images stored under unrelated record IDs or inside CV documents.

## Conclusion and remaining source

The absence is documented before the October 13 merge, as early as the
October 12 backup that contains these experts. The historical deletion or
upload event remains unknown. The server inspection does not prove that an
image never existed.

The October 11 Hostinger full-server backup remains a potentially useful source.
Safely examining it requires provider-assisted file extraction or a separately
mounted/cloned copy. Restoring it over this VPS would roll back unrelated live
data and services and was not attempted.
