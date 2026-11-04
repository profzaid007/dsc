# Production admin inspection — 26 October 2026

Inspected the user's authenticated PocketBase admin session on
`https://backend-prod.dsc.ac`. Only read-only navigation and backup download
were performed. No restore, deletion, backup initialization, or settings change
was performed.

The Backups page lists one archive: `dsc-test-oct-20.zip` (89 MB). No older
archive is listed. Backup options show automatic backups disabled and S3 backup
storage disabled. File storage settings also show S3 disabled; uploaded files
use the server's local filesystem. This does not rule out snapshots or archives
managed separately by the hosting provider or server administrator.

Downloaded the listed archive to `D:/SysDir/Download/dsc-test-oct-20.zip` and
inspected its database and storage offline. It contains 131 stored files. The
six previously identified experts all have empty photo fields. Their associated
account/profile storage paths contain no separate portrait images; five contain
CV documents and Salsabell's contains no stored files. No photos were restored
or inferred from CV documents.

The archive's test-oriented filename alone does not establish whether the
production URL currently targets a test instance or whether the archive was
uploaded manually. Server/proxy configuration is needed to establish that.

Further investigation requires hosting-console or SSH access to inspect
provider snapshots, other PocketBase instance directories, and backups outside
PocketBase's configured backup store. The admin UI does not provide a filesystem
browser for unreferenced files on the live server.

Local inspection report:
`../work/production-photo-storage-oct20-report.json` (relative to workspace root).
