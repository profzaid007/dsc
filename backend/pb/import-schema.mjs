// Imports pb_schema.json into a PocketBase v0.31 instance.
//
// Usage:
//   PB_URL=http://127.0.0.1:8090 \
//   PB_SUPERUSER_EMAIL=admin@local.test PB_SUPERUSER_PASSWORD=Passw0rd!123 \
//   node import-schema.mjs
//
// WARNING: deleteMissing=true replaces the whole non-system schema and drops
// records of collections/fields that are not in pb_schema.json.

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090"
const SU_EMAIL = process.env.PB_SUPERUSER_EMAIL
const SU_PASSWORD = process.env.PB_SUPERUSER_PASSWORD

if (!SU_EMAIL || !SU_PASSWORD) {
  console.error("Set PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD")
  process.exit(1)
}

const schema = JSON.parse(readFileSync(join(__dirname, "pb_schema.json"), "utf8"))

const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ identity: SU_EMAIL, password: SU_PASSWORD }),
})
const auth = await authRes.json()
if (!auth.token) {
  console.error("Auth failed:", JSON.stringify(auth))
  process.exit(1)
}

const res = await fetch(`${PB_URL}/api/collections/import`, {
  method: "PUT",
  headers: { "Content-Type": "application/json", Authorization: auth.token },
  body: JSON.stringify({ collections: schema, deleteMissing: true }),
})
if (!res.ok) {
  console.error(`Import failed (${res.status}):`, (await res.text()).slice(0, 1000))
  process.exit(1)
}
console.log(`Imported ${schema.length} collections.`)
