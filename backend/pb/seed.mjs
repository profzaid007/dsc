// Seeds a DSC PocketBase instance after pb_schema.json has been imported.
//
// Usage:
//   PB_URL=http://127.0.0.1:8090 \
//   PB_SUPERUSER_EMAIL=admin@local.test PB_SUPERUSER_PASSWORD=Passw0rd!123 \
//   APP_ADMIN_EMAIL=admin@dsc.local APP_ADMIN_PASSWORD='ChangeMe123!' \
//   node seed.mjs
//
// Idempotent: existing lookups/roles/portals are left untouched.

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))

const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090"
const SU_EMAIL = process.env.PB_SUPERUSER_EMAIL
const SU_PASSWORD = process.env.PB_SUPERUSER_PASSWORD
const ADMIN_EMAIL = process.env.APP_ADMIN_EMAIL || "admin@dsc.local"
const ADMIN_PASSWORD = process.env.APP_ADMIN_PASSWORD || "ChangeMe123!"
const ADMIN_NAME = process.env.APP_ADMIN_NAME || "Administrator"

if (!SU_EMAIL || !SU_PASSWORD) {
  console.error("Set PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD")
  process.exit(1)
}

const TOOL_TYPES = [
  { key: "survey", label_en: "Survey", label_ar: "استبيان" },
  { key: "multiple_answer", label_en: "Multiple Answer", label_ar: "اختيار متعدد" },
  { key: "report", label_en: "Report", label_ar: "تقرير" },
  { key: "plan", label_en: "Plan", label_ar: "خطة" },
  { key: "attachment_request", label_en: "Attachment Request", label_ar: "طلب مرفقات" },
  { key: "one_to_one_meeting", label_en: "One-to-One Meeting", label_ar: "اجتماع فردي" },
]

const USER_TYPES = [
  { key: "parent", label_en: "Parent", label_ar: "ولي أمر" },
  { key: "individual", label_en: "Individual", label_ar: "فرد" },
  { key: "organization", label_en: "Organization", label_ar: "منظمة" },
  { key: "expert", label_en: "Expert", label_ar: "خبير" },
]

const ROLES = [
  { role_name_en: "Physician", role_name_ar: "طبيب" },
  { role_name_en: "Social Specialist", role_name_ar: "أخصائي اجتماعي" },
  { role_name_en: "Teacher", role_name_ar: "معلم" },
  { role_name_en: "Trainer", role_name_ar: "مدرب" },
]

let token = ""

async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`${PB_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status} ${text.slice(0, 400)}`)
  }
  return data
}

async function findOne(collection, filter) {
  const q = encodeURIComponent(filter)
  const data = await api(`/api/collections/${collection}/records?perPage=1&filter=${q}`)
  return data.items[0] || null
}

async function ensure(collection, filter, payload, label) {
  const existing = await findOne(collection, filter)
  if (existing) {
    console.log(`= ${collection}: ${label} (exists)`)
    return existing
  }
  const created = await api(`/api/collections/${collection}/records`, {
    method: "POST",
    body: payload,
  })
  console.log(`+ ${collection}: ${label}`)
  return created
}

async function main() {
  const auth = await api("/api/collections/_superusers/auth-with-password", {
    method: "POST",
    body: { identity: SU_EMAIL, password: SU_PASSWORD },
  })
  token = auth.token

  for (const [i, t] of TOOL_TYPES.entries()) {
    await ensure(
      "lookups",
      `type = "tool_types" && key = "${t.key}"`,
      { type: "tool_types", key: t.key, label_en: t.label_en, label_ar: t.label_ar, order: i, is_active: true },
      `tool_types/${t.key}`
    )
  }
  for (const [i, t] of USER_TYPES.entries()) {
    await ensure(
      "lookups",
      `type = "user_types" && key = "${t.key}"`,
      { type: "user_types", key: t.key, label_en: t.label_en, label_ar: t.label_ar, order: i, is_active: true },
      `user_types/${t.key}`
    )
  }

  for (const r of ROLES) {
    await ensure(
      "roles_management",
      `role_name_en = "${r.role_name_en}"`,
      r,
      r.role_name_en
    )
  }

  const portals = JSON.parse(readFileSync(join(__dirname, "seed-portals.json"), "utf8"))
  for (const [i, p] of portals.entries()) {
    await ensure(
      "portals",
      `portal_key = "${p.id}"`,
      {
        portal_key: p.id,
        title_en: p.title.en,
        title_ar: p.title.ar,
        description_en: p.tagline.en,
        description_ar: p.tagline.ar,
        icon: p.icon,
        registration_type: p.registrationType,
        accent: p.accent,
        order: i,
        is_deleted: false,
        config: p,
      },
      `portal ${p.id}`
    )
  }

  await ensure(
    "expert_display_settings",
    'key = "landing"',
    { key: "landing", expert_ids: [] },
    "expert_display_settings/landing"
  )

  const settings = await findOne("settings", "")
  if (!settings) {
    await api("/api/collections/settings/records", {
      method: "POST",
      body: {
        payment_bank_details: {
          currency: "SAR",
          bank_name: "",
          account_number: "",
          iban: "",
          beneficiary: "",
        },
      },
    })
    console.log("+ settings: payment_bank_details")
  } else {
    console.log("= settings (exists)")
  }

  const existingAdmin = await findOne("users", `email = "${ADMIN_EMAIL}"`)
  if (existingAdmin) {
    const patch = {}
    if (existingAdmin.role !== "super_admin") patch.role = "super_admin"
    if (existingAdmin.is_active !== true) patch.is_active = true
    if (!existingAdmin.name) patch.name = ADMIN_NAME
    if (Object.keys(patch).length) {
      await api(`/api/collections/users/records/${existingAdmin.id}`, {
        method: "PATCH",
        body: patch,
      })
      console.log(`~ users: ${ADMIN_EMAIL} (updated ${Object.keys(patch).join(", ")})`)
    } else {
      console.log(`= users: ${ADMIN_EMAIL} (ok)`)
    }
  } else {
    await api("/api/collections/users/records", {
      method: "POST",
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        passwordConfirm: ADMIN_PASSWORD,
        emailVisibility: true,
        name: ADMIN_NAME,
        role: "super_admin",
        is_active: true,
      },
    })
    console.log(`+ users: admin ${ADMIN_EMAIL}`)
  }

  console.log("\nSeed complete.")
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
