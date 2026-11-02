// PocketBase <0.34 requires explicit submitted-value guards instead of :changed.
// Preserve every existing ownership, status, visibility and financial restriction.
migrate((app) => {
  for (const name of ["cases", "case_tools", "case_feedback"]) {
    const collection = app.findCollectionByNameOrId(name)
    const before = String(collection.updateRule || "")
    if (!before.includes(":changed")) continue
    const after = before.replace(
      /@request\.body\.([a-zA-Z0-9_]+):changed\s*=\s*false\b/g,
      "(@request.body.$1:isset = false || @request.body.$1 = $1)"
    )
    if (after.includes(":changed")) throw new Error("Review unsupported change guard in " + name)
    collection.updateRule = after
    app.save(collection)
  }
}, () => { throw new Error("Restore a reviewed backup instead of restoring unsupported permission rules.") })
