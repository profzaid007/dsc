// Repair unsupported change guards without weakening ownership or payment restrictions.
migrate(
  (app) => {
    for (const name of [
      "cases",
      "case_tools",
      "case_feedback",
      "internal_messages",
    ]) {
      const c = app.findCollectionByNameOrId(name)
      const before = String(c.updateRule || "")
      c.updateRule = before.replace(
        /@request\.body\.([a-zA-Z0-9_]+):changed\s*=\s*false\b/g,
        "(@request.body.$1:isset = false || @request.body.$1 = $1)"
      )
      if (c.updateRule !== before) app.save(c)
    }
    for (const name of ["programs", "public_lectures"]) {
      const c = app.findCollectionByNameOrId(name)
      for (const key of ["listRule", "viewRule"])
        c[key] = String(c[key]).replace(
          /is_public = true/g,
          "(is_public = true && (status = 'published' || status = 'in_progress' || status = 'completed'))"
        )
      app.save(c)
    }
    const view = app.findCollectionByNameOrId("public_lectures_public")
    view.viewQuery = String(view.viewQuery).replace(
      /WHERE is_public = true$/,
      "WHERE is_public = true AND status IN ('published', 'in_progress', 'completed')"
    )
    app.save(view)
  },
  () => {
    throw new Error("Unsupported permission rules must not be restored")
  }
)
