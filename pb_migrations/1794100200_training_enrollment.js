migrate(
  (app) => {
    const cases = app.findCollectionByNameOrId("cases")
    const status = cases.fields.getByName("program_status")
    if (status.type === "select" && !status.values.includes("cancelled"))
      status.values.push("cancelled")
    if (status.type === "select" && !status.values.includes("completed"))
      status.values.push("completed")
    app.save(cases)
    // Retain original enrollment rows for historical references; use cases for all training workflows.
    const rows = app.findAllRecords(
      "event_registrations",
      $dbx.exp("program_id != ''")
    )
    for (const old of rows) {
      const found = app.findRecordsByFilter(
        "cases",
        "program_id = {:p} && user = {:u} && portal_type = 'Attending Training'",
        "",
        1,
        0,
        { p: old.getString("program_id"), u: old.getString("user_id") }
      )
      if (found.length) continue
      const program = app.findRecordById(
        "programs",
        old.getString("program_id")
      )
      const row = new Record(cases)
      row.set("user", old.getString("user_id"))
      row.set("program_id", program.id)
      const title = program.get("name")
      row.set(
        "name",
        typeof title === "object" ? title.en || title.ar : String(title)
      )
      row.set("portal_type", "Attending Training")
      row.set("service_type", row.getString("name"))
      row.set("status", "pending")
      const state = old.getString("status")
      row.set("program_status", state === "registered" ? "enrolled" : state)
      row.set("user_details", {
        name: old.getString("user_name"),
        email: old.getString("email"),
        contact: old.getString("phone"),
      })
      app.save(row)
    }
    // Existing duplicate records are preserved for review; the runtime transaction prevents new duplicates.
    for (const program of app.findAllRecords("programs")) {
      const active = app.findRecordsByFilter(
        "cases",
        "program_id = {:p} && portal_type = 'Attending Training' && program_status != 'cancelled'",
        "",
        0,
        0,
        { p: program.id }
      )
      program.set("current_registrations", active.length)
      app.save(program)
    }
  },
  () => {
    throw new Error("Retain migrated enrollment history")
  }
)
