# CMS content capacity: backend deployment required

The supplied About Us document contains 8,440 characters before the storage marker. PocketBase text fields with `max: 0` apply a default limit of 5,000 characters. A failed write returns `validation_max_text_constraint`; it does not persist the oversized document.

The additive migration is available in both deployment trees:

- `pb_migrations/1793000000_cms_content_capacity.js`
- `backend/pb/pb_migrations/1793000000_cms_content_capacity.js`

It increases `content_en` and `content_ar` to 1,000,000 characters for `home_pages`, `info_pages`, and `blog_pages`. It retains larger configured limits, existing editor fields, field IDs, content, and access rules. Rollback intentionally retains the larger capacity so existing layouts remain editable. The canonical fresh-install schema includes the same limits.

## Existing test service

The known test instance is `/srv/pb_instances/pb_dsc_test`, running as `zephyr` under `pb_dsc_test.service`. This is separate from the production, development and other PocketBase services. Updating Netlify does not update this instance's schema.

An administrator with server access must:

1. Upload **only** the capacity migration into `/srv/pb_instances/pb_dsc_test/pb_migrations/`.
2. Stop `pb_dsc_test.service` and back up its `pb_data/data.db` consistently before applying the migration.
3. Run the migration using the service account and the instance's directories:

   ```sh
   cd /srv/pb_instances/pb_dsc_test
   sudo -u zephyr /usr/bin/pocketbase migrate up \
     --dir /srv/pb_instances/pb_dsc_test/pb_data \
     --migrationsDir /srv/pb_instances/pb_dsc_test/pb_migrations \
     --hooksDir /srv/pb_instances/pb_dsc_test/pb_hooks
   ```

4. Start `pb_dsc_test.service`, confirm it is active and check `http://127.0.0.1:8082/api/health`.
5. Save the original HTML again in the published CMS and wait for the verified-save status. Reopen the Arabic tab to confirm persistence.

Alternatively, an authenticated **PocketBase superuser** can edit the six collection fields in PocketBase's administration panel and set each text field's maximum length to `1000000`, retaining its type and other settings. A DSC application Super Admin is a separate account and does not automatically have PocketBase administration access.

The temporary SSH authorization used during the earlier security deployment was removed after that deployment. Applying this change requires fresh authorized server access or a human administrator performing the schema update.
