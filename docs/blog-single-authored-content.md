# Single authored blog content

Blog posts use `title` and `content`. Their values are exactly what the author entered, in English, Arabic, or mixed text. Interface language translates controls only. Reading, editing, creating, uploading files, previews, and public rendering use these same fields. Home and information pages retain their separate bilingual models; this change is scoped to blog articles.

Deploy `1794400000_single_authored_blog.js` before publishing the frontend. Take a database backup first. The migration checks every article before changing the schema. Conflicting language versions stop the migration with record IDs and field names. Those records require an editorial choice; the migration does not choose one version over another. Identical copies or a single populated version can be transferred without ambiguity. It then removes `title_en`, `title_ar`, `content_en`, and `content_ar`.

No live schema or records were changed during implementation. No compatibility reads or duplicate language writes remain in blog runtime code. The fresh-install schema uses the same single-field model. An isolated PocketBase rehearsal verifies text preservation, removal of old fields, and rejection of conflicting versions.
