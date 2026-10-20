module.exports = (e) => {
  const b = e.requestInfo().body
  const u = b.user || {},
    p = b.profile || {},
    cases = b.cases || []
  const roles = {
    individual: "individual_profiles",
    parent: "parent_profiles",
    organization: "organization_profiles",
    care_foundation: "organization_profiles",
  }
  if (
    !roles[u.role] ||
    p.collection !== roles[u.role] ||
    !Array.isArray(cases) ||
    cases.length > 30
  )
    throw new BadRequestError("Invalid registration")
  const text = (value, required, max) => {
    if (value !== undefined && typeof value !== "string")
      throw new BadRequestError("Invalid text field")
    const s = String(value || "").trim()
    if ((required && !s) || s.length > max)
      throw new BadRequestError("Missing or invalid registration field")
    return s
  }
  const phone = (value) => {
    const s = text(value, true, 40).replace(/[\s()\-]/g, "")
    if (!/^\+[1-9]\d{6,14}$/.test(s))
      throw new BadRequestError("Enter a valid international telephone number")
    return s
  }
  const email = text(u.email, true, 254).toLowerCase(),
    name = text(u.name, true, 200)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new BadRequestError("Invalid email")
  const password = text(u.password, true, 128)
  if (password !== u.passwordConfirm || password.length < 8)
    throw new BadRequestError(
      "Passwords must match and contain at least 8 characters"
    )
  const contact = phone(u.contact_number),
    key = text(b.submission_key, true, 64)
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(key))
    throw new BadRequestError("Invalid submission key")
  const fields = {
    individual_profiles: [
      "gender",
      "date_of_birth",
      "country_of_residence",
      "emergency_contact_name",
      "emergency_contact_phone",
      "notes",
    ],
    parent_profiles: ["country_of_residence", "notes"],
    organization_profiles: [
      "organization_name",
      "organization_type",
      "country",
      "city",
      "address",
      "website",
      "responsible_person_name",
      "responsible_person_title",
      "responsible_person_phone",
      "notes",
    ],
  }
  if (u.role === "individual" && !["male", "female"].includes(p.gender))
    throw new BadRequestError("Select a gender")
  if (p.collection === "organization_profiles")
    text(p.organization_name, true, 200)
  if (p.emergency_contact_phone)
    p.emergency_contact_phone = phone(p.emergency_contact_phone)
  const date = (value) => {
    if (
      value &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        !Number.isFinite(Date.parse(value)) ||
        new Date(value).toISOString().slice(0, 10) !== value ||
        Date.parse(value) > Date.now())
    )
      throw new BadRequestError("Invalid date of birth")
  }
  date(p.date_of_birth)
  for (const c of cases) {
    text(c.name, true, 200)
    text(c.portal_type, true, 200)
    text(c.service_type, true, 200)
    date(c.date_of_birth)
    if (u.role === "parent") {
      text(c.relationship, true, 100)
      if (!["male", "female"].includes(c.gender))
        throw new BadRequestError("Select child gender")
    }
  }
  let user
  e.app.runInTransaction((app) => {
    const prior = app.findRecordsByFilter(
      p.collection,
      "submission_key = {:key}",
      "",
      1,
      0,
      { key }
    )
    if (prior.length) {
      user = app.findRecordById("users", prior[0].getString("user"))
      if (
        user.getString("email").toLowerCase() !== email ||
        user.getString("role") !== u.role ||
        !user.validatePassword(password)
      )
        throw new BadRequestError("Invalid registration retry")
      return
    }
    user = new Record(app.findCollectionByNameOrId("users"))
    for (const [field, value] of Object.entries({
      email,
      name,
      password,
      contact_number: contact,
      role: u.role,
      is_active: true,
      emailVisibility: true,
    }))
      user.set(field, value)
    app.save(user)
    const profile = new Record(app.findCollectionByNameOrId(p.collection))
    for (const field of fields[p.collection])
      if (p[field] !== undefined)
        profile.set(
          field,
          text(p[field], false, field === "notes" ? 5000 : 300)
        )
    profile.set("user", user.id)
    profile.set("submission_key", key)
    app.save(profile)
    if (b.program_id) {
      const program = app.findRecordById(
        "programs",
        text(b.program_id, true, 30)
      )
      const row = new Record(app.findCollectionByNameOrId("cases"))
      const title = program.get("name")
      row.set(
        "name",
        typeof title === "object" ? title.en || title.ar : String(title)
      )
      row.set("user", user.id)
      row.set("portal_type", "Attending Training")
      row.set("service_type", row.getString("name"))
      row.set("program_id", program.id)
      row.set("program_status", "enrolled")
      row.set("status", "pending")
      row.set("user_details", { name, email, contact })
      app.save(row)
    }
    for (const c of cases) {
      const row = new Record(app.findCollectionByNameOrId("cases"))
      for (const field of [
        "name",
        "date_of_birth",
        "gender",
        "grade",
        "relationship",
        "portal_type",
        "service_type",
        "notes",
      ])
        if (c[field] !== undefined)
          row.set(field, text(c[field], false, field === "notes" ? 5000 : 300))
      row.set("user", user.id)
      row.set("status", "pending")
      row.set("user_details", { name, email, contact })
      const details = c.case_details || {}
      row.set("case_details", {
        custom_category: text(details.custom_category, false, 200),
        custom_sub_category: text(details.custom_sub_category, false, 200),
      })
      app.save(row)
    }
  })
  return e.json(200, { id: user.id, success: true })
}
