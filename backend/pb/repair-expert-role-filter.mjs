// Targeted, additive repair. Does not replace the canonical schema or seed data.
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { compatibleProfileUpdateRule } from "./profile-rule-compat.mjs"

export function expertRoleFilterRepair(collections) {
  const find = name => {
    const collection = collections.find(item => item.name === name)
    if (!collection) throw new Error(`Missing collection: ${name}`)
    return structuredClone(collection)
  }
  const roles = find("roles_management")
  const profiles = find("expert_profiles")
  const experts = find("experts_public")
  const has = (collection, name) => collection.fields.some(field => field.name === name)
  const changes = []
  const users = collections.find(item => item.name === "users")
  if (users && compatibleProfileUpdateRule(users.updateRule) !== users.updateRule) {
    changes.push({ ...structuredClone(users), updateRule: compatibleProfileUpdateRule(users.updateRule) })
  }
  profiles.updateRule = compatibleProfileUpdateRule(profiles.updateRule)
  let profileChanged = profiles.updateRule !== collections.find(item => item.name === "expert_profiles").updateRule
  if (!has(profiles, "specialist_roles")) {
    profiles.fields.push({ name: "specialist_roles", type: "relation", collectionId: roles.id, maxSelect: 100, cascadeDelete: false })
    profileChanged = true
  }
  if (profileChanged) changes.push(profiles)
  if (!/\bexpert_profiles\.specialist_roles\b/.test(experts.viewQuery)) {
    const query = experts.viewQuery.replace(/\bFROM\s+expert_profiles\b/i, ", expert_profiles.specialist_roles FROM expert_profiles")
    if (query === experts.viewQuery) throw new Error("Unrecognized experts_public query; review it manually.")
    experts.viewQuery = query
    changes.push(experts)
  }
  const categoryTable = collections.find(item => item.name === "specialist_role_categories")
  const useCategories = has(roles, "category") && categoryTable?.fields.some(field => field.name === "key")
  const categoryGroup = useCategories ? "CASE c.key WHEN 'psychology' THEN 'mental-health' ELSE COALESCE(c.key, '') END" : "''"
  const group = has(roles, "role_group") ? `COALESCE(NULLIF(r.role_group, ''), ${categoryGroup})` : categoryGroup
  const order = has(roles, "role_order") ? "r.role_order" : has(roles, "order") ? 'r."order"' : "0"
  const retired = has(roles, "is_retired") ? "r.is_retired" : "0"
  const viewQuery = `SELECT r.id, r.role_name_en, r.role_name_ar, (${group}) AS role_group, ${order} AS role_order, ${retired} AS is_retired FROM roles_management r${useCategories ? " LEFT JOIN specialist_role_categories c ON r.category = c.id" : ""}`
  const existing = collections.find(item => item.name === "expert_roles_public")
  if (!existing || existing.viewQuery !== viewQuery || existing.listRule !== "" || existing.viewRule !== "") {
    changes.push({ ...(existing ? structuredClone(existing) : {}), name: "expert_roles_public", type: "view", listRule: "", viewRule: "", viewQuery })
  }
  return changes
}

async function main() {
  const base = process.env.PB_URL?.replace(/\/$/, "")
  if (!base) throw new Error("Set PB_URL to the backend that serves the published site.")
  let token = ""
  const api = async (path, options = {}) => {
    const response = await fetch(`${base}${path}`, {
      method: options.method || "GET",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: token } : {}) },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    })
    if (!response.ok) throw new Error(`${options.method || "GET"} ${path}: HTTP ${response.status}`)
    return response.status === 204 ? null : response.json()
  }
  if (!process.argv.includes("--apply")) {
    for (const name of ["experts_public", "expert_roles_public"]) {
      try {
        const data = await api(`/api/collections/${name}/records?perPage=1`)
        const sample = data.items[0]
        console.log(`${name}: ${data.totalItems} records; ${name === "experts_public" ? `saved role IDs ${sample && "specialist_roles" in sample ? "present" : "missing or no records"}` : "available"}`)
      } catch (error) { console.log(error.message) }
    }
    return
  }
  const identity = process.env.PB_SUPERUSER_EMAIL
  const password = process.env.PB_SUPERUSER_PASSWORD
  if (!identity || !password) throw new Error("Set PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD locally; do not paste credentials into chat.")
  const auth = await api("/api/collections/_superusers/auth-with-password", { method: "POST", body: { identity, password } })
  token = auth.token
  const schemas = []
  for (let page = 1; ; page++) {
    const result = await api(`/api/collections?page=${page}&perPage=100`)
    schemas.push(...result.items)
    if (page >= result.totalPages) break
  }
  const changes = expertRoleFilterRepair(schemas)
  if (changes.length) {
    // Import only the additive changes; never delete missing fields/collections.
    await api("/api/collections/import", { method: "PUT", body: { collections: changes, deleteMissing: false } })
    console.log(`Updated: ${changes.map(item => item.name).join(", ")}`)
  } else console.log("The public expert role views are already configured.")
  const [experts, roles] = await Promise.all([
    api("/api/collections/experts_public/records?perPage=1"),
    api("/api/collections/expert_roles_public/records?perPage=1"),
  ])
  if (experts.items.length && !("specialist_roles" in experts.items[0])) throw new Error("Saved role IDs are still absent from experts_public.")
  console.log(`Verified: ${experts.totalItems} public experts, ${roles.totalItems} public roles.`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}
