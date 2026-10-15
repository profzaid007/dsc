// Reconstruct the pre-security policy without duplicating or freezing every
// business field in the canonical schema. Used by generation and upgrade tests.
const fs = require("node:fs")
const path = require("node:path")
module.exports = function securityBaseSchema(root) {
  const schema = JSON.parse(
    fs.readFileSync(path.join(root, "backend/pb/pb_schema.json"), "utf8")
  )
  const baseline = JSON.parse(
    fs.readFileSync(
      path.join(root, "backend/pb/security-schema-rules.json"),
      "utf8"
    )
  )
  return schema
    .filter((c) => !c.name.startsWith("security_"))
    .map((c) => {
      if (baseline[c.name]) {
        Object.assign(c, baseline[c.name].rules)
        for (const field of c.fields)
          if (field.type === "file" && field.name in baseline[c.name].files)
            field.protected = baseline[c.name].files[field.name]
      }
      if (c.name === "users")
        c.fields = c.fields.filter((f) => f.name !== "security_permissions")
      return c
    })
}
