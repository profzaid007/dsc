# Expert photo investigation — 25 October 2026

## Findings

The test backend public expert view contains 30 experts: 24 nonempty photo
references and six empty references. All 24 referenced test files returned HTTP 200. The screenshot shows initials for Ghadeer Abu Qudairi, Thahabiya, Tariq
Alzyoud and Salsabell Almshaqbah; each has an empty `profile_photo` field.

The supplied old/source and new/destination database snapshots, the merged
candidate and the specialist baseline also contain empty photo and account
avatar fields for these experts. Source snapshot matching used account names
because profile IDs differ between databases. The original production public
view at `https://backend-prod.dsc.ac` also returns empty photo fields for these
four experts and Naela Shatat.

This establishes that the absence predates the supplied migration snapshots.
It does NOT establish that a photo was never uploaded, who removed a photo,
or what image the user previously saw. No historical photo-change audit trail
was found in the checked snapshots. There is no evidence here that the recent
migration or a current image URL failure removed these four photos.

## Save-path inspection and prevention

`hooks/useExpertProfile.ts` already omits the photo field during ordinary edits;
only an explicit removal sends an empty field. New applications upload a photo
only if selected. The public carousel displays initials when that field is empty.

Added server enforcement in both deployment copies of
`expert-profile-sync.pb.js`: an update cannot clear an existing photo unless the
request also explicitly confirms photo removal. The shared editor save helper
now supplies that confirmation when Remove was selected. Uploaded replacements
remain supported; PocketBase finalizes their filenames during save.

Photo changes now write the actor, profile ID and previous/new filenames to the
existing `security_audit_log`, in the same transaction as the update. Audit
failure fails the save. These are metadata records, not copies of deleted images.

These guards cover profile updates through the PocketBase record API. Direct
database edits, internal server writes, whole-record deletion, storage loss and
backup restores need separate operational controls. Back up the database AND
file storage together before imports/restores; retain the pre-change backup.
Compare the photo baseline after changes and investigate any newly missing
reference or failed download before accepting the deployment. Approved expert
deletions will appear as lost references and require review.

## Repeatable check

Read-only check and baseline comparison:

```powershell
node tools/check-expert-photos.mjs --url https://test.spcloud.pro --baseline reports/expert-photo-baseline-2026-10-25.json
```

The command exits nonzero on inaccessible/non-image files or lost photo
references. It distinguishes already-empty fields from new regressions. To
create a reviewed baseline for another backend, use `--save-baseline` with a
new filename. Existing baseline files are never overwritten. This check has
not been installed as a recurring monitor or deployment gate.

## Validation and rollout

Unit coverage verifies omitted photo fields on ordinary saves, explicit removal,
replacement uploads, rejected unconfirmed clears, audit entries, audit failure
propagation, and matching backend hook copies. A disposable PocketBase 0.31.0
integration test verifies real multipart uploads/replacements, JSON and multipart
accidental clears, intentional removal, and persisted audit records.

Changes are local. Publish the frontend save helper before or alongside the
backend hook; an old client cannot intentionally remove a photo once the new
hook is installed. The audit collection and `lib/security-policy.js` must be
present (provided by the existing security deployment). No live backend or
frontend deployment was performed for this investigation.
