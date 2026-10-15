migrate((app) => {
  const experts = app.findCollectionByNameOrId("experts_public")
  // Keep the existing public fields, joins and active-account restriction intact.
  if (!/\bexpert_profiles\.specialist_roles\b/.test(experts.viewQuery)) {
    const query = experts.viewQuery.replace(
      /\bFROM\s+expert_profiles\b/i,
      ", expert_profiles.specialist_roles FROM expert_profiles"
    )
    if (query === experts.viewQuery) throw new Error("Review the experts_public query before adding role filtering.")
    experts.viewQuery = query
    app.save(experts)
  }
}, () => {
  throw new Error("Restore a reviewed backup to revert public expert role filtering.")
})
