// Copies expert users + expert_profiles (and their files) from a source
// PocketBase to a target PocketBase.
//

//
// Add-only and idempotent:
//   - users are matched by email (existing emails are skipped)
//   - profiles are matched by the linked user id
//
// Flags:
//   --dry-run   print what would happen without writing anything
//
// Notes:
//   - Password hashes cannot be exported; copied users get TEMP_PASSWORD.
//   - The orphan prod profile (user="") is skipped.
//   - age_group (array) -> json field; client_type (array) -> ", "-joined text.

import { fileURLToPath } from "node:url"

const args = process.argv.slice(2)
const DRY_RUN = args.includes("--dry-run") || process.env.DRY_RUN === "1"

const PROD_URL = (process.env.PROD_URL )
const DEV_URL = (process.env.DEV_URL )
const EMAIL = process.env.PB_ADMIN_EMAIL
const PASSWORD = process.env.PB_ADMIN_PASSWORD
const TEMP_PASSWORD = process.env.TEMP_PASSWORD || "ProdCopy123!"

if (!EMAIL || !PASSWORD) {
  console.error("Set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD")
  process.exit(1)
}

const stats = {
  usersCreated: 0,
  usersSkipped: 0,
  profilesCreated: 0,
  profilesUpdated: 0,
  profilesSkipped: 0,
  filesUploaded: 0,
  errors: [],
}

async function auth(base) {
  const res = await fetch(`${base}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: EMAIL, password: PASSWORD }),
  })
  const data = await res.json()
  if (!data.token) throw new Error(`auth failed for ${base}: ${JSON.stringify(data)}`)
  return data.token
}

function h(token, json = true) {
  return json
    ? { "Content-Type": "application/json", Authorization: token }
    : { Authorization: token }
}

async function listAll(base, token, collection, filter) {
  const out = []
  let page = 1
  for (;;) {
    const q = new URLSearchParams({ page: String(page), perPage: "200" })
    if (filter) q.set("filter", filter)
    const res = await fetch(`${base}/api/collections/${collection}/records?${q}`, {
      headers: h(token, false),
    })
    if (!res.ok) throw new Error(`list ${collection} failed: ${res.status} ${await res.text()}`)
    const data = await res.json()
    out.push(...data.items)
    if (page >= data.totalPages || data.items.length === 0) break
    page++
  }
  return out
}

async function downloadFile(base, token, collection, recordId, filename) {
  const url = `${base}/api/files/${collection}/${recordId}/${encodeURIComponent(filename)}`
  const res = await fetch(url, { headers: h(token, false) })
  if (!res.ok) return null
  return Buffer.from(await res.arrayBuffer())
}

function joinList(value) {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string" && v).join(", ")
  return typeof value === "string" ? value : ""
}

async function main() {
  console.log(`source: ${PROD_URL}`)
  console.log(`target: ${DEV_URL}`)
  if (DRY_RUN) console.log("mode:   DRY RUN (no writes)")

  const prodToken = await auth(PROD_URL)
  const devToken = await auth(DEV_URL)

  const prodUsers = await listAll(PROD_URL, prodToken, "users", 'role = "expert"')
  const prodProfiles = await listAll(PROD_URL, prodToken, "expert_profiles")
  console.log(`\nprod expert users: ${prodUsers.length}`)
  console.log(`prod expert profiles: ${prodProfiles.length}`)

  const devUsers = await listAll(DEV_URL, devToken, "users", 'role = "expert"')
  const devByEmail = new Map(devUsers.map((u) => [u.email.toLowerCase(), u]))

  // ------------------------------------------------------------------ users
  const devUserIdByProdId = new Map()
  for (const pu of prodUsers) {
    const key = (pu.email || "").toLowerCase()
    const existing = devByEmail.get(key)
    if (existing) {
      devUserIdByProdId.set(pu.id, existing.id)
      stats.usersSkipped++
      console.log(`  = user ${pu.email} (exists)`)
      continue
    }
    if (DRY_RUN) {
      stats.usersCreated++
      devUserIdByProdId.set(pu.id, `dry-run:${pu.id}`)
      console.log(`  + user ${pu.email} (would create)`)
      continue
    }
    try {
      const fd = new FormData()
      fd.set("email", pu.email)
      fd.set("password", TEMP_PASSWORD)
      fd.set("passwordConfirm", TEMP_PASSWORD)
      fd.set("emailVisibility", "true")
      fd.set("verified", "true")
      fd.set("name", pu.name || "")
      fd.set("role", "expert")
      fd.set("is_active", String(pu.is_active === true))
      fd.set("contact_number", pu.contact_number || "")
      if (pu.avatar) {
        const buf = await downloadFile(PROD_URL, prodToken, "users", pu.id, pu.avatar)
        if (buf) {
          fd.set("avatar", new Blob([buf]), pu.avatar)
          stats.filesUploaded++
        }
      }
      const res = await fetch(`${DEV_URL}/api/collections/users/records`, {
        method: "POST",
        headers: h(devToken, false),
        body: fd,
      })
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`)
      const created = await res.json()
      devUserIdByProdId.set(pu.id, created.id)
      stats.usersCreated++
      console.log(`  + user ${pu.email}`)
    } catch (err) {
      stats.errors.push(`user ${pu.email}: ${err.message}`)
      console.log(`  ! user ${pu.email}: ${err.message}`)
    }
  }

  // --------------------------------------------------------------- profiles
  const devProfiles = await listAll(DEV_URL, devToken, "expert_profiles")
  const devProfileByUser = new Map(devProfiles.map((p) => [p.user, p]))

  for (const pp of prodProfiles) {
    if (!pp.user) {
      stats.profilesSkipped++
      console.log(`  ~ profile ${pp.id} (orphan, skipped)`)
      continue
    }
    const devUserId = devUserIdByProdId.get(pp.user)
    if (!devUserId) {
      stats.profilesSkipped++
      console.log(`  ~ profile ${pp.id} (no matching dev user, skipped)`)
      continue
    }

    const fields = {
      user: devUserId,
      full_legal_name: pp.full_legal_name || "",
      nationality: pp.nationality || "",
      country_of_residence: pp.country_of_residence || "",
      city: pp.city || "",
      whatsapp_country_code: pp.whatsapp_country_code || "",
      whatsapp_number: pp.whatsapp_number || "",
      highest_academic_degree: pp.highest_academic_degree || "",
      degree_title: pp.degree_title || "",
      field_of_study: pp.field_of_study || "",
      consultation_mode: pp.consultation_mode || "",
      status: pp.status || "",
      specialization_type: pp.specialization_type || "",
      fee: pp.fee || "",
      availability: pp.availability || "",
      bio: pp.bio || "",
      preferred_languages: pp.preferred_languages || "",
      age_group: JSON.stringify(Array.isArray(pp.age_group) ? pp.age_group : []),
      client_type: joinList(pp.client_type),
    }

    const existing = devProfileByUser.get(devUserId)

    if (existing) {
      stats.profilesSkipped++
      console.log(`  = profile ${existing.id} (exists)`)
      continue
    }

    if (DRY_RUN) {
      stats.profilesCreated++
      console.log(`  + profile for user ${devUserId} (would create)`)
      continue
    }

    try {
      const fd = new FormData()
      for (const [k, v] of Object.entries(fields)) fd.set(k, v)
      for (const field of ["profile_photo", "cv"]) {
        const filename = pp[field]
        if (!filename) continue
        const buf = await downloadFile(PROD_URL, prodToken, "expert_profiles", pp.id, filename)
        if (buf) {
          fd.set(field, new Blob([buf]), filename)
          stats.filesUploaded++
        }
      }
      const res = await fetch(`${DEV_URL}/api/collections/expert_profiles/records`, {
        method: "POST",
        headers: h(devToken, false),
        body: fd,
      })
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`)
      const saved = await res.json()
      stats.profilesCreated++
      devProfileByUser.set(devUserId, saved)
      console.log(`  + profile ${saved.id}`)
    } catch (err) {
      stats.errors.push(`profile ${pp.id}: ${err.message}`)
      console.log(`  ! profile ${pp.id}: ${err.message}`)
    }
  }

  console.log("\n===== summary =====")
  console.log(`users   created=${stats.usersCreated} skipped=${stats.usersSkipped}`)
  console.log(`profiles created=${stats.profilesCreated} updated=${stats.profilesUpdated} skipped=${stats.profilesSkipped}`)
  console.log(`files   uploaded=${stats.filesUploaded}`)
  if (stats.errors.length) {
    console.log(`errors  ${stats.errors.length}`)
    for (const e of stats.errors) console.log(`   - ${e}`)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error("FATAL", err.message)
  process.exit(1)
})
