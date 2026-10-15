migrate((app) => {
  // Keep all existing admin/owner restrictions and protected-field checks.
  for (const name of ["users", "expert_profiles"]) {
    const collection = app.findCollectionByNameOrId(name)
    if (typeof collection.updateRule !== "string") continue
    const compatible = collection.updateRule.replace(
      /@request\.body\.([a-zA-Z0-9_]+):changed\s*=\s*false\b/g,
      "(@request.body.$1:isset = false || @request.body.$1 = $1)"
    )
    if (compatible !== collection.updateRule) {
      collection.updateRule = compatible
      app.save(collection)
    }
  }
}, () => {
  throw new Error("The previous rule syntax is unsupported on PocketBase 0.31.")
})
