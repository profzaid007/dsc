#!/usr/bin/bash
set -euo pipefail
instance=/srv/pb_instances/pb_dsc_test
service=pb_dsc_test.service
test "$(id -u)" -eq 0
test -f "$instance/pb_data/data.db"
case "$(systemctl show "$service" -p ExecStart --value)" in
  *"$instance/pb_data"*) ;;
  *) echo "Unexpected instance; stopped without changes."; exit 1 ;;
esac
stage=$(mktemp -d "$instance/.expert-submission-XXXXXX")
chmod 755 "$stage"
install -d -m 755 "$stage/migrations" "$stage/hooks/lib"
cat > "$stage/migrations/1793600000_expert_submission.js" <<'EXPERT_UPDATE_0'
// A private idempotency key prevents retrying a successful submission from creating duplicates.
migrate(app => {
  const c = app.findCollectionByNameOrId("expert_profiles")
  if (!c.fields.getByName("submission_key")) {
    c.fields.add(new TextField({name:"submission_key", max:64, hidden:true}))
    app.save(c)
  }
}, () => {})
EXPERT_UPDATE_0
cat > "$stage/migrations/1793600100_remove_incomplete_expert_attempts.js" <<'EXPERT_UPDATE_1'
// Remove only failed inactive expert accounts with no profile and no operational references.
migrate(app => {
  const users = app.findCollectionByNameOrId("users")
  const collections = app.findAllCollections()
  const candidates = app.findRecordsByFilter("users", 'role = "expert" && is_active = false', "", 0, 0)
  let deleted = 0
  let retained = 0
  for (const user of candidates) {
    if (app.findRecordsByFilter("expert_profiles", "user = {:id}", "", 1, 0, {id:user.id}).length) continue
    let referenced = false
    for (const collection of collections) {
      if (collection.type === "view" || collection.name === "expert_bank_details") continue
      for (const field of collection.fields) {
        const type = typeof field.type === "function" ? field.type() : field.type
        if (type === "relation" && field.collectionId === users.id && app.findRecordsByFilter(collection.name, field.name + " ?= {:id}", "", 1, 0, {id:user.id}).length) referenced = true
      }
    }
    if (referenced) { retained++; continue }
    // IBAN rows were written by the earlier partial registration flow.
    const bankCollection = collections.find(c => c.name === "expert_bank_details")
    if (bankCollection) for (const bank of app.findRecordsByFilter(bankCollection.name, "user = {:id}", "", 0, 0, {id:user.id})) app.delete(bank)
    app.delete(user)
    deleted++
  }
  console.log("Incomplete expert attempts removed: " + deleted + "; retained because linked to operational records: " + retained)
}, () => {
  // Restore deleted attempts only from the deployment database backup if needed.
})
EXPERT_UPDATE_1
cat > "$stage/hooks/expert-registration.pb.js" <<'EXPERT_UPDATE_2'
routerAdd("GET", "/api/dsc/expert-registration-config", (e) => {
  e.app.findCollectionByNameOrId("expert_bank_details")
  return e.json(200, { iban: true, atomic: !!e.app.findCollectionByNameOrId("expert_profiles").fields.getByName("submission_key") })
})

onRecordCreateRequest((e) => {
  if (e.requestInfo().body.role === "expert" && (!e.auth || !e.auth.getBool("is_active") || !["admin", "super_admin"].includes(e.auth.getString("role"))))
    throw new BadRequestError("Submit a complete expert application through the registration form")
  const value = e.requestInfo().body.expert_iban
  if (!value) return e.next()
  if (e.record.getString("role") !== "expert" || typeof value !== "string")
    throw new BadRequestError("Invalid expert IBAN")
  const iban = value.replace(/\s/g, "").toUpperCase()
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban))
    throw new BadRequestError("Invalid IBAN")
  let remainder = 0
  for (const char of iban.slice(4) + iban.slice(0, 4)) {
    const digits = /[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char
    for (const digit of digits)
      remainder = (remainder * 10 + Number(digit)) % 97
  }
  if (remainder !== 1) throw new BadRequestError("Invalid IBAN checksum")
  // The IBAN belongs only to this newly created user; no public bank-data write API.
  e.app.runInTransaction((txApp) => {
    e.app = txApp
    e.next()
    const bank = new Record(
      txApp.findCollectionByNameOrId("expert_bank_details")
    )
    bank.set("user", e.record.id)
    bank.set("iban", iban)
    txApp.save(bank)
  })
}, "users")

// Both records and all uploads commit together; a profile/bank validation error rolls back the account.
routerAdd("POST", "/api/dsc/expert-register", e => require(`${__hooks}/lib/expert-submission.js`)(e), $apis.bodyLimit(40 * 1024 * 1024))
EXPERT_UPDATE_2
cat > "$stage/hooks/lib/expert-submission.js" <<'EXPERT_UPDATE_3'
module.exports = (e) => {
  const body = e.requestInfo().body
  let data
  try { data = typeof body.profile === "string" ? JSON.parse(body.profile) : body.profile } catch { throw new BadRequestError("Invalid profile") }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new BadRequestError("Complete expert profile is required")
  const key = String(body.submission_key || "")
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(key)) throw new BadRequestError("Invalid submission key")
  const email = String(body.email || "").trim().toLowerCase()
  const password = String(body.password || "")
  if (password.length < 8 || password !== body.passwordConfirm) throw new BadRequestError("Passwords must match and contain at least 8 characters")
  if (!String(data.public_name_en || "").trim() || !String(data.public_name_ar || "").trim()) throw new BadRequestError("Both expert names are required")
  const profileCollection = e.app.findCollectionByNameOrId("expert_profiles")
  if (!profileCollection.fields.getByName("submission_key")) throw new BadRequestError("Apply the expert submission migration first")
  const uploaded = key => {
    try { return e.findUploadedFiles(key) } catch (error) {
      if (String(error).includes("no such file")) return []
      throw error
    }
  }
  const photos = uploaded("profile_photo")
  const cvs = uploaded("cv")
  const fields = ["country_of_residence", "city", "whatsapp_country_code", "whatsapp_number", "highest_academic_degree", "degree_title", "field_of_study", "age_group", "specialization_type", "specialist_roles", "consultation_mode", "public_name_en", "public_name_ar", "public_qualification_en", "public_qualification_ar", "public_specialty_en", "public_specialty_ar", "short_bio_en", "short_bio_ar", "availability", "fee"]
  for (const field of fields) if (!profileCollection.fields.getByName(field)) throw new BadRequestError("Expert profile storage is not configured: " + field)
  for (const field of ["short_bio_en", "short_bio_ar"]) if (String(data[field] || "").length > 250) throw new BadRequestError("Biography must not exceed 250 characters")
  const iban = String(body.expert_iban || "").replace(/\s/g, "").toUpperCase()
  if (iban) {
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) throw new BadRequestError("Invalid IBAN")
    let remainder = 0
    for (const char of iban.slice(4) + iban.slice(0,4)) {
      const digits = /[A-Z]/.test(char) ? String(char.charCodeAt(0)-55) : char
      for (const digit of digits) remainder=(remainder*10+Number(digit))%97
    }
    if (remainder !== 1) throw new BadRequestError("Invalid IBAN checksum")
  }
  let user
  e.app.runInTransaction(app => {
    // Check retry ownership inside the same transaction as the insert.
    const previous = app.findRecordsByFilter("expert_profiles", "submission_key = {:key}", "", 1, 0, {key})
    if (previous.length) {
      const owner = app.findRecordById("users", previous[0].getString("user"))
      if (owner.getString("role") !== "expert" || owner.getString("email").toLowerCase() !== email || !owner.validatePassword(password)) throw new BadRequestError("Invalid submission retry")
      user = owner
      return
    }
    user = new Record(app.findCollectionByNameOrId("users"))
    user.set("email", email)
    user.set("emailVisibility", true)
    user.set("name", String(data.public_name_ar || data.public_name_en).trim())
    user.set("password", password)
    user.set("role", "expert")
    user.set("is_active", false)
    app.save(user)
    const profile = new Record(app.findCollectionByNameOrId("expert_profiles"))
    for (const field of fields) if (data[field] !== undefined) profile.set(field, data[field])
    profile.set("user", user.id)
    profile.set("status", "submitted")
    profile.set("submission_key", key)
    profile.set("profile_photo", photos)
    profile.set("cv", cvs)
    app.save(profile)
    if (iban) {
      const bank = new Record(app.findCollectionByNameOrId("expert_bank_details"))
      bank.set("user", user.id)
      bank.set("iban", iban)
      app.save(bank)
    }
  })
  return e.json(200, {id:user.id, token:user.newAuthToken(), success:true})
}
EXPERT_UPDATE_3
chmod 644 "$stage/migrations/"*.js "$stage/hooks/"*.js "$stage/hooks/lib/"*.js
for file in "$stage/migrations/"*.js; do
  name=$(basename "$file")
  if [ -f "$instance/pb_migrations/$name" ] && ! cmp -s "$file" "$instance/pb_migrations/$name"; then
    echo "A different migration exists; stopped without changes: $name"; exit 1
  fi
done
backup="/root/dsc-expert-submission-backup-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -m 700 "$backup"
systemctl stop "$service"
trap 'systemctl start "$service"' EXIT
cp -p "$instance/pb_data/data.db" "$backup/data.db"
if [ -d "$instance/pb_hooks" ]; then tar -czf "$backup/hooks.tar.gz" -C "$instance" pb_hooks; fi
cd /tmp
output=$(runuser -u zephyr -- /usr/bin/pocketbase migrate up --dir "$instance/pb_data" --migrationsDir "$stage/migrations" --hooksDir "$instance/pb_hooks" 2>&1)
printf '%s\n' "$output"
case "$output" in *Error:*|*ERROR*) echo "Migration failed; restarting existing service."; exit 1 ;; esac
case "$output" in *"Applied 1793600100_remove_incomplete_expert_attempts.js"*|*"No new migrations"*) ;; *) echo "Cannot confirm migration; stopped."; exit 1 ;; esac
install -d -o zephyr -g zephyr "$instance/pb_migrations" "$instance/pb_hooks/lib"
for file in "$stage/migrations/"*.js; do install -o zephyr -g zephyr -m 644 "$file" "$instance/pb_migrations/$(basename "$file")"; done
install -o zephyr -g zephyr -m 644 "$stage/hooks/expert-registration.pb.js" "$instance/pb_hooks/expert-registration.pb.js"
for file in "$stage/hooks/lib/"*.js; do install -o zephyr -g zephyr -m 644 "$file" "$instance/pb_hooks/lib/$(basename "$file")"; done
systemctl start "$service"
trap - EXIT
systemctl is-active "$service"
curl --retry 10 --retry-connrefused --retry-delay 1 --fail --silent --show-error http://127.0.0.1:8082/api/health
printf '\nDone. Database backup: %s/data.db\n' "$backup"
