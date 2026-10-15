migrate((app) => {
  const categories = app.findCollectionByNameOrId("specialist_role_categories")
  const roles = app.findCollectionByNameOrId("roles_management")
  if (!roles.fields.getByName("category")) {
    throw new Error("Apply the specialist category relation before enabling category deletion.")
  }
  // Narrow existing access only; never grant deletion to a new role or unlock a
  // collection whose direct deletion is disabled. Inactive roles count too.
  if (categories.deleteRule !== null) {
    const unused = 'roles_management_via_category.id = ""'
    if (!categories.deleteRule.includes(unused)) {
      categories.deleteRule = categories.deleteRule
        ? `(${categories.deleteRule}) && ${unused}`
        : unused
      app.save(categories)
    }
  }
}, () => {
  // Keep the restrictive rule on rollback rather than broaden delete access.
})
