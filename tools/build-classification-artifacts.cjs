const fs = require("node:fs")
const path = require("node:path")
const root = path.resolve(__dirname, "..")
const catalog = fs.readFileSync(path.join(root, "lib/classification-catalog.json"), "utf8").trim()
const migration = fs.readFileSync(path.join(root, "backend/pb/classification-migration.template.js"), "utf8").replace("__CLASSIFICATION_CATALOG__", catalog)
for (const dir of ["backend/pb/pb_migrations", "pb_migrations"]) fs.writeFileSync(path.join(root, dir, "1793200000_unified_classification.js"), migration)
const source = "// Generated from lib/classification-catalog.json\nmodule.exports = " + catalog + "\n"
for (const dir of ["backend/pb/pb_hooks/lib", "pb_hooks/lib"]) fs.writeFileSync(path.join(root, dir, "classification-catalog.js"), source)
for (const file of ["classification.pb.js", "lib/classification-validation.js"]) fs.copyFileSync(path.join(root, "backend/pb/pb_hooks", file), path.join(root, "pb_hooks", file))
