# Strict role, expert profile, and payment contracts

- Missing or obsolete professional role categories are correction errors; names are not used to infer categories.
- Public pages and the specialist selector read only expert_roles_public. roles_management remains the source collection behind that view and the target of role relations. It must not be deleted.
- Expert text-list fields use comma-separated text. age_group is changed from JSON to text after incompatible records are corrected. specialist_roles and cv remain native relation/file arrays, not alternate text encodings.
- New expert writes reject arrays/JSON text in age_group, specialization_type, preferred_languages, and client_type.
- Missing case status resolves to awaiting_payment in the payment gate. The migration persists awaiting_payment and is_paid=false for blank statuses.

Apply 1794500000_strict_profile_and_payment.js together with the strict runtime hooks before the frontend. It stops with collection/record/field references if corrections are required. No automatic category inference or incompatible profile conversion is performed. A backup and review of the reported records are required before applying on a server. The schema file uses text age_group for new installations.

No live records were read or changed for this implementation; existing server corrections have not yet been enumerated. Prior uncommitted migrations in the workspace must be reviewed separately before any deployment.
